/**
 * Custom assertion utilities for more expressive tests
 * Following TDD principle: Clear, readable assertions
 */

import { expect } from 'vitest'
import { screen } from '@testing-library/react'

// Assert element is visible and accessible
export const assertAccessible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument()
  expect(element).toBeVisible()
  expect(element).not.toHaveAttribute('aria-hidden', 'true')
  expect(element).not.toHaveStyle({ display: 'none' })
}

// Assert form field has error
export const assertFieldError = (fieldName: string, errorMessage: string) => {
  const field = screen.getByRole('textbox', { name: fieldName }) ||
                screen.getByRole('combobox', { name: fieldName })
  
  expect(field).toHaveAttribute('aria-invalid', 'true')
  expect(screen.getByText(errorMessage)).toBeInTheDocument()
}

// Assert form is valid
export const assertFormValid = (formElement: HTMLFormElement) => {
  const invalidFields = formElement.querySelectorAll('[aria-invalid="true"]')
  expect(invalidFields).toHaveLength(0)
  
  const errorMessages = formElement.querySelectorAll('[role="alert"]')
  expect(errorMessages).toHaveLength(0)
}

// Assert loading state
export const assertLoading = (container?: HTMLElement) => {
  const scope = container || document.body
  const loadingElements = scope.querySelectorAll(
    '[role="progressbar"], [aria-busy="true"], .loading, .spinner'
  )
  expect(loadingElements.length).toBeGreaterThan(0)
}

// Assert not loading
export const assertNotLoading = (container?: HTMLElement) => {
  const scope = container || document.body
  const loadingElements = scope.querySelectorAll(
    '[role="progressbar"], [aria-busy="true"], .loading, .spinner'
  )
  expect(loadingElements).toHaveLength(0)
}

// Assert toast/notification message
export const assertNotification = (message: string, type?: 'success' | 'error' | 'warning' | 'info') => {
  const notification = screen.getByRole('alert') || screen.getByRole('status')
  expect(notification).toHaveTextContent(message)
  
  if (type) {
    expect(notification).toHaveClass(type)
  }
}

// Assert table has expected data
export const assertTableData = (
  table: HTMLTableElement,
  expectedData: Array<Record<string, any>>
) => {
  const rows = table.querySelectorAll('tbody tr')
  expect(rows).toHaveLength(expectedData.length)
  
  expectedData.forEach((rowData, index) => {
    const cells = rows[index].querySelectorAll('td')
    Object.values(rowData).forEach((value, cellIndex) => {
      expect(cells[cellIndex]).toHaveTextContent(String(value))
    })
  })
}

// Assert list items
export const assertListItems = (listElement: HTMLElement, expectedItems: string[]) => {
  const items = listElement.querySelectorAll('li')
  expect(items).toHaveLength(expectedItems.length)
  
  expectedItems.forEach((text, index) => {
    expect(items[index]).toHaveTextContent(text)
  })
}

// Assert button state
export const assertButtonState = (
  button: HTMLButtonElement,
  state: { disabled?: boolean; loading?: boolean; text?: string }
) => {
  if (state.disabled !== undefined) {
    state.disabled
      ? expect(button).toBeDisabled()
      : expect(button).toBeEnabled()
  }
  
  if (state.loading !== undefined) {
    state.loading
      ? expect(button).toHaveAttribute('aria-busy', 'true')
      : expect(button).not.toHaveAttribute('aria-busy', 'true')
  }
  
  if (state.text) {
    expect(button).toHaveTextContent(state.text)
  }
}

// Assert navigation occurred
export const assertNavigation = (mockRouter: any, expectedPath: string) => {
  expect(mockRouter.push).toHaveBeenCalledWith(expectedPath)
}

// Assert API was called
export const assertApiCalled = (
  fetchMock: any,
  endpoint: string,
  options?: { method?: string; body?: any }
) => {
  const calls = fetchMock.mock.calls.filter((call: any[]) => 
    call[0].includes(endpoint)
  )
  
  expect(calls.length).toBeGreaterThan(0)
  
  if (options) {
    const [url, fetchOptions] = calls[0]
    
    if (options.method) {
      expect(fetchOptions.method).toBe(options.method)
    }
    
    if (options.body) {
      const body = JSON.parse(fetchOptions.body)
      expect(body).toEqual(options.body)
    }
  }
}

// Assert Redux/Context state
export const assertState = (result: any, expectedState: any) => {
  expect(result.current).toMatchObject(expectedState)
}

// Assert element has focus
export const assertFocused = (element: HTMLElement) => {
  expect(element).toHaveFocus()
}

// Assert ARIA attributes
export const assertAria = (
  element: HTMLElement,
  attributes: Record<string, string>
) => {
  Object.entries(attributes).forEach(([attr, value]) => {
    expect(element).toHaveAttribute(`aria-${attr}`, value)
  })
}

// Assert CSS classes
export const assertClasses = (element: HTMLElement, classes: string[]) => {
  classes.forEach(className => {
    expect(element).toHaveClass(className)
  })
}

// Assert element count
export const assertElementCount = (
  container: HTMLElement,
  selector: string,
  count: number
) => {
  const elements = container.querySelectorAll(selector)
  expect(elements).toHaveLength(count)
}

// Custom matchers for Convex
export const assertConvexMutation = (
  mockMutation: any,
  mutationName: string,
  expectedArgs?: any
) => {
  expect(mockMutation).toHaveBeenCalledWith(
    mutationName,
    expectedArgs ? expect.objectContaining(expectedArgs) : expect.anything()
  )
}

export const assertConvexQuery = (
  mockQuery: any,
  queryName: string,
  expectedArgs?: any
) => {
  expect(mockQuery).toHaveBeenCalledWith(
    queryName,
    expectedArgs ? expect.objectContaining(expectedArgs) : expect.anything()
  )
}