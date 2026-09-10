import { debounce } from 'lodash-es'

export function withDep(fn) {
  return debounce(fn, 10)
}
