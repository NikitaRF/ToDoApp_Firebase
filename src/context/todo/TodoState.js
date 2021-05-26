import React, { useReducer, useContext } from 'react'
import { Alert } from 'react-native'
import { TodoContext } from './todoContext'
import { todoReducer } from './todoReducer'
import {ADD_TODO, CLEAR_ERROR, HIDE_LOADER, REMOVE_TODO, SHOW_ERROR, SHOW_LOADER, UPDATE_TODO} from '../types'
import {ScreenContext} from "../screen/screenContext";


export const TodoState = ({ children }) => {
  const initialState = {
    todos: [],
    loading: false,
    error: null,
  }

  const showLoader = () => dispatch({type: SHOW_LOADER})
  const hideLoader = () => dispatch({type: HIDE_LOADER})
  const showError = (error) => ({type: SHOW_ERROR, error})
  const clearError = () => ({type: CLEAR_ERROR})


  const {changeScreen} = useContext(ScreenContext)

  const [state, dispatch] = useReducer(todoReducer, initialState)

  const addTodo = async title => {
      const response = await fetch('https://todoapp-aa2ea-default-rtdb.europe-west1.firebasedatabase.app/todos.json', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({title})
      })
      const data = await response.json()
      console.log(data)

      dispatch({ type: ADD_TODO, title, id: data.name })
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
                  onPress: () => {
                      changeScreen(null)
                      dispatch({ type: REMOVE_TODO, id })
                  }
                }
              ],
              { cancelable: false }
            )
  }

  const updateTodo = (id, title) => dispatch({ type: UPDATE_TODO, id, title })

  return (
    <TodoContext.Provider
      value={{
        todos: state.todos,
        addTodo,
        removeTodo,
        updateTodo
      }}
    >
      {children}
    </TodoContext.Provider>
  )
}
