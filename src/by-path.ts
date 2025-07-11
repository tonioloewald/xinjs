// unique tokens passed to set by path to delete or create properties

import { XinObject, XinArray, XinScalar } from './xin-types'
import { makeError } from './make-error'

const now36 = (): string =>
  new Date(parseInt('1000000000', 36) + Date.now())
    .valueOf()
    .toString(36)
    .slice(1)
let _seq = 0
const seq = (): string =>
  (parseInt('10000', 36) + ++_seq).toString(36).slice(-5)
const id = (): string => now36() + seq()

const _delete_ = {}
const _newObject_ = {}

type Part = string | string[]
type PartArray = Part[]

function pathParts(path: string | PartArray): PartArray {
  if (path === '') {
    return []
  }

  if (Array.isArray(path)) {
    return path
  } else {
    const parts: PartArray = []
    while (path.length > 0) {
      let index = path.search(/\[[^\]]+\]/)
      if (index === -1) {
        parts.push(path.split('.'))
        break
      } else {
        const part = path.slice(0, index)
        path = path.slice(index)
        if (part !== '') {
          parts.push(part.split('.'))
        }
        index = path.indexOf(']') + 1
        parts.push(path.slice(1, index - 1))
        // handle paths dereferencing array element like foo[0].id
        if (path.slice(index, index + 1) === '.') {
          index += 1
        }
        path = path.slice(index)
      }
    }
    return parts
  }
}

const idPathMaps = new WeakMap()

interface IdPathMap {
  [key: string]: number
}

function buildIdPathValueMap(array: XinObject[], idPath: string): IdPathMap {
  if (idPathMaps.get(array) === undefined) {
    idPathMaps.set(array, {})
  }
  if (idPathMaps.get(array)[idPath] === undefined) {
    idPathMaps.get(array)[idPath] = {}
  }
  const map = idPathMaps.get(array)[idPath]

  if (idPath === '_auto_') {
    array.forEach((item, idx) => {
      if (item._auto_ === undefined) item._auto_ = id()
      map[(item._auto_ as string) + ''] = idx
    })
  } else {
    array.forEach((item, idx) => {
      map[(getByPath(item, idPath) as string) + ''] = idx
    })
  }
  return map
}

function getIdPathMap(array: XinObject[], idPath: string): IdPathMap {
  if (
    idPathMaps.get(array) === undefined ||
    idPathMaps.get(array)[idPath] === undefined
  ) {
    return buildIdPathValueMap(array, idPath)
  } else {
    return idPathMaps.get(array)[idPath]
  }
}

function keyToIndex(array: XinObject[], idPath: string, idValue: any): number {
  idValue = (idValue as string) + ''
  let idx = getIdPathMap(array, idPath)[idValue]
  if (
    idx === undefined ||
    (getByPath(array[idx], idPath) as string) + '' !== idValue
  ) {
    idx = buildIdPathValueMap(array, idPath)[idValue]
  }
  return idx
}

function byKey(obj: XinObject, key: string, valueToInsert?: any): any {
  if (obj[key] === undefined && valueToInsert !== undefined) {
    obj[key] = valueToInsert
  }
  return obj[key]
}

function byIdPath(
  array: any[],
  idPath: string,
  idValue: string,
  valueToInsert?: any
): any {
  let idx = idPath !== '' ? keyToIndex(array, idPath, idValue) : idValue
  if (valueToInsert === _delete_) {
    array.splice(idx as number, 1)
    idPathMaps.delete(array)
    return Symbol('deleted')
  } else if (valueToInsert === _newObject_) {
    if (idPath === '' && array[idx as number] === undefined) {
      array[idx as number] = {}
    }
  } else if (valueToInsert !== undefined) {
    if (idx !== undefined) {
      array[idx as number] = valueToInsert
    } else if (
      idPath !== '' &&
      (getByPath(valueToInsert, idPath) as string) + '' === idValue + ''
    ) {
      array.push(valueToInsert)
      idx = array.length - 1
    } else {
      throw new Error(`byIdPath insert failed at [${idPath}=${idValue}]`)
    }
  }
  return array[idx as number]
}

function expectArray(obj: any): void {
  if (!Array.isArray(obj)) {
    throw makeError('setByPath failed: expected array, found', obj)
  }
}

function expectObject(obj: any): void {
  if (obj == null || !(obj instanceof Object)) {
    throw makeError('setByPath failed: expected Object, found', obj)
  }
}

function getByPath(obj: XinObject | XinArray, path: string): any {
  const parts = pathParts(path)
  let found: XinObject | XinArray | XinScalar = obj
  let i, iMax, j, jMax
  for (i = 0, iMax = parts.length; found !== undefined && i < iMax; i++) {
    const part = parts[i]
    if (Array.isArray(part)) {
      for (j = 0, jMax = part.length; found !== undefined && j < jMax; j++) {
        const key = part[j]
        found = (found as XinObject)[key]
      }
    } else {
      if ((found as XinArray).length === 0) {
        found = (found as XinArray)[Number(part.slice(1))]
        if (part[0] !== '=') {
          return undefined
        }
      } else if (part.includes('=')) {
        const [idPath, ...tail] = part.split('=')
        found = byIdPath(found as any[], idPath, tail.join('='))
      } else {
        j = parseInt(part, 10)
        found = (found as XinArray)[j]
      }
    }
  }
  return found
}

function setByPath(
  orig: XinObject | XinArray,
  path: string,
  val: any
): boolean {
  let obj: XinObject | XinArray | XinScalar = orig
  const parts = pathParts(path)

  while (obj != null && parts.length > 0) {
    const part = parts.shift()
    if (typeof part === 'string') {
      const equalsOffset = part.indexOf('=')
      if (equalsOffset > -1) {
        if (equalsOffset === 0) {
          expectObject(obj)
        } else {
          expectArray(obj)
        }
        const idPath = part.slice(0, equalsOffset)
        const idValue = part.slice(equalsOffset + 1)
        obj = byIdPath(
          obj as any[],
          idPath,
          idValue,
          parts.length > 0 ? _newObject_ : val
        )
        if (parts.length === 0) {
          return true
        }
      } else {
        expectArray(obj)
        const idx = parseInt(part, 10)
        if (parts.length > 0) {
          obj = (obj as XinArray)[idx]
        } else {
          if (val !== _delete_) {
            if ((obj as XinArray)[idx] === val) {
              return false
            }
            ;(obj as XinArray)[idx] = val
          } else {
            ;(obj as XinArray).splice(idx, 1)
          }
          return true
        }
      }
    } else if (Array.isArray(part) && part.length > 0) {
      expectObject(obj)
      while (part.length > 0) {
        const key = part.shift() as string
        if (part.length > 0 || parts.length > 0) {
          // if we're at the end of part.length then we need to insert an array
          obj = byKey(obj as XinObject, key, part.length > 0 ? {} : [])
        } else {
          if (val !== _delete_) {
            if ((obj as XinObject)[key] === val) {
              return false
            }
            ;(obj as XinObject)[key] = val
          } else {
            if (!Object.prototype.hasOwnProperty.call(obj, key)) {
              return false
            }
            delete (obj as XinObject)[key]
          }
          return true
        }
      }
    } else {
      throw new Error(`setByPath failed, bad path ${path}`)
    }
  }

  throw new Error(`setByPath(${orig}, ${path}, ${val}) failed`)
}

function deleteByPath(orig: XinObject, path: string): void {
  if (getByPath(orig, path) !== null) {
    setByPath(orig, path, _delete_)
  }
}

export { getByPath, setByPath, deleteByPath, pathParts }
