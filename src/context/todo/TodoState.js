import React, { useReducer, useContext } from 'react'
import { Alert } from 'react-native'
import { TodoContext } from './todoContext'
import { todoReducer } from './todoReducer'
import {
    ADD_TODO,
    CLEAR_ERROR,
    FETCH_TODOS,
    HIDE_LOADER,
    REMOVE_TODO,
    SHOW_ERROR,
    SHOW_LOADER,
    UPDATE_TODO
} from '../types'
import {ScreenContext} from "../screen/screenContext";
import {Http} from "../../http";


export const TodoState = ({ children }) => {
  const initialState = {
    todos: [],
    loading: false,
    error: null,
  }

  const showLoader = () => dispatch({type: SHOW_LOADER})
  const hideLoader = () => dispatch({type: HIDE_LOADER})
  const showError = (error) => dispatch({type: SHOW_ERROR, error})
  const clearError = () => dispatch({type: CLEAR_ERROR})
  const updateTodo = async (id, title) => {
      showLoader()
      clearError()
      try {
          await fetch(`https://todoapp-aa2ea-default-rtdb.europe-west1.firebasedatabase.app/todos/${id}.json`,{
              method: 'PATCH',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({title})
          } )
          dispatch({type: UPDATE_TODO, id, title})
      } catch (e) {
          showError('Что-то пошло не так...')
          console.log(e)
      } finally {
          hideLoader()
      }
  }


  const fetchTodos = async () => {
      showLoader()
      clearError()
      try {
          const response = await fetch('https://todoapp-aa2ea-default-rtdb.europe-west1.firebasedatabase.app/todos.json', {
              method: 'GET',
              headers: {'Content-Type': 'application/json'},
          })
          const data = await response.json()
          const todos = Object.keys(data).map((key) => {
              return {...data[key], id: key}
          })
          dispatch({type: FETCH_TODOS, todos})
      } catch (e) {
          showError('Что-то пошло не так...')
          console.log(e)
      } finally {
          hideLoader()

      }
  }


  const {changeScreen} = useContext(ScreenContext)

  const [state, dispatch] = useReducer(todoReducer, initialState)

  const addTodo = async title => {
      // const response = await fetch('https://todoapp-aa2ea-default-rtdb.europe-west1.firebasedatabase.app/todos.json', {
      //     method: 'POST',
      //     headers: {'Content-Type': 'application/json'},
      //     body: JSON.stringify({title})
      // })
      clearError()
      try {
          const data = await Http.post('https://todoapp-aa2ea-default-rtdb.europe-west1.firebasedatabase.app/todos.json', {title})
          dispatch({ type: ADD_TODO, title, id: data.name })
      } catch (e) {
          showError("Что-то пошло не так...")
      }

  }

  const removeTodo = id => {
      const todo = state.todos.find(t => t.id === id)
      Alert.alert(
              'Удаление элемента',
              `Вы уверены, что хотите удалить "${todo.title}"?`,
              [
                {
                  text: 'Отмена',
                  style: 'cancel'
                },
                {
                  text: 'Удалить',
                  style: 'destructive',
                  onPress: async () => {
                      changeScreen(null)
                      await fetch(`https://todoapp-aa2ea-default-rtdb.europe-west1.firebasedatabase.app/todos/${id}.json`, {
                          method: 'DELETE',
                          headers: {'Content-Type': 'application/json'},

                      })
                      dispatch({ type: REMOVE_TODO, id })
                  }
                }
              ],
              { cancelable: false }
            )
  }


  return (
    <TodoContext.Provider
      value={{
          todos: state.todos,
          loading: state.loading,
          error: state.error,
          addTodo,
          removeTodo,
          updateTodo,
          fetchTodos,

      }}
    >
      {children}
    </TodoContext.Provider>
  )
}
