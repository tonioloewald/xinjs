/**

~~~~
// title: getByPath, setByPath, and pathParts tests

const {getByPath, setByPath, pathParts} = await import('../source/b8r.byPath.js');
const obj = {
  foo: 17,
  bar: {baz: 'hello'},
  list: [
    {id: 17, name: 'fred'},
    {id: 100, name: 'boris'}
  ],
  bool: false,
  obj: null,
};

const list = [
  {id: 17, name: 'fred'},
  {id: 100, name: 'boris'},
  obj
]

const debug = console.debug; // prevent errors from leaking to console
errors = []
console.debug = (...args) => errors.push(args[1])

Test(() => getByPath(obj, '')).shouldBe(obj);
Test(() => getByPath(obj, '/')).shouldBe(obj);
Test(() => getByPath(obj, 'foo')).shouldBe(17);
Test(() => getByPath(obj, '[=foo]')).shouldBe(17);
Test(() => getByPath(obj, 'bar.baz')).shouldBe('hello');
Test(() => getByPath(obj, '[=bar][=baz]')).shouldBe('hello');
Test(() => getByPath(list, '[0].id')).shouldBe(17);
Test(() => getByPath(list, '[id=100].name')).shouldBe('boris');
Test(() => getByPath(list, '[bar.baz=hello].foo')).shouldBe(17);
Test(() => getByPath(list, '[bar.baz=hello].list[id=17].name')).shouldBe('fred');
Test(() => {
  setByPath(obj, 'obj', {bar: 17});
  return obj.obj.bar;
}).shouldBe(17);
Test(() => {
  setByPath(obj, 'obj', null);
  return obj.obj;
}).shouldBe(null);
Test(() => {
  setByPath(obj, '[=obj]', {hello: 'world'});
  return obj.obj.hello;
}).shouldBe('world');
Test(() => {
  setByPath(obj, '[=obj][=hello]', 'mars');
  return obj.obj.hello;
}).shouldBe('mars');
Test(() => {
  setByPath(obj, 'list[id=17]', {id: 17, name: 'vlad'});
  return getByPath(obj, 'list[id=17].name');
}).shouldBe('vlad');
Test(() => {
  setByPath(obj, 'list[id=17]', {id: 17, name: 'vlad'});
  return getByPath(obj, 'list[id=17].name');
}).shouldBe('vlad');
Test(() => {
  setByPath(obj, 'list[id=13]', {id:13, name:'success'});
  return getByPath(obj, 'list[id=13].name');
}, 'insert-by-id works for new elements').shouldBe('success');
Test(() => {
  setByPath(obj, 'list[id=13].name', 'replaced');
  return getByPath(obj, 'list[id=13].name');
}, 'id-path in middle of path works').shouldBe('replaced');
Test(() => {
  setByPath(obj, 'list[id=13]', {id:13, name:'overwrite'});
  return getByPath(obj, 'list').length;
}, 'insert-by-id works does not create duplicates').shouldBe(3);
Test(() => {
  let caught = 0;
  try {
    setByPath(obj, 'list[id=20]', {name: 'failure'});
  } catch(e) {
    caught++;
  }
  return caught;
}, 'item inserted at idPath must satisfy it').shouldBe(1);
Test(() => errors, 'bad list bindings reported').shouldBeJSON(["inconsistent id-path 'bar.baz' used for array, expected 'id'"]);

console.debug = debug
~~~~
*/
/* global console */

// unique tokens passed to set by path to delete or create properties

import {XinObject} from './xin-types'
import {makeError} from './make-error'

const now36 = () => new Date(parseInt('1000000000', 36) + Date.now()).valueOf().toString(36).slice(1)
let _seq = 0
const seq = () => (parseInt('10000', 36) + (++_seq)).toString(36).substr(-5)
const id = () => now36() + seq()

const _delete_ = {}
const _newObject_ = {}

function pathParts (path: string) {
  if (!path || path === '/') {
    return []
  }

  if (Array.isArray(path)) {
    return path
  } else {
    const parts = []
    while (path.length) {
      var index = path.search(/\[[^\]]+\]/)
      if (index === -1) {
        parts.push(path.split('.'))
        break
      } else {
        const part = path.substr(0, index)
        path = path.substr(index)
        if (part) {
          parts.push(part.split('.'))
        }
        index = path.indexOf(']') + 1
        parts.push(path.substr(1, index - 2))
        // handle paths dereferencing array element like foo[0].id
        if (path.substr(index, 1) === '.') {
          index += 1
        }
        path = path.substr(index)
      }
    }
    return parts
  }
}

const idPathMaps = new WeakMap()

function buildIdPathValueMap (array: XinObject[], idPath: string) {
  if (array && !idPathMaps.get(array)) {
    idPathMaps.set(array, {})
  }
  if (!idPathMaps.get(array)[idPath]) {
    idPathMaps.get(array)[idPath] = {}
  }
  const map = idPathMaps.get(array)[idPath]

  if (idPath === '_auto_') {
    array.forEach((item, idx) => {
      if (item._auto_ === undefined) item._auto_ = id()
      map[item._auto_ + ''] = idx
    })
  } else {
    array.forEach((item, idx) => {
      map[getByPath(item, idPath) + ''] = idx
    })
  }
  return map
}

function getIdPathMap (array: XinObject[], idPath: string) {
  if (!idPathMaps.get(array) || !idPathMaps.get(array)[idPath]) {
    return buildIdPathValueMap(array, idPath)
  } else {
    return idPathMaps.get(array)[idPath]
  }
}

function keyToIndex (array: XinObject[], idPath: string, idValue: any) {
  idValue = idValue + ''
  /*
  if (array.length > 200) {
    return array.findIndex(a => getByPath(a, idPath) + '' === idValue)
  } */
  let idx = getIdPathMap(array, idPath)[idValue]
  if (idx === undefined || getByPath(array[idx], idPath) + '' !== idValue) {
    idx = buildIdPathValueMap(array, idPath)[idValue]
  }
  return idx
}

function byKey (obj: XinObject, key: string, valueToInsert?: any) {
  if (!obj[key]) {
    obj[key] = valueToInsert
  }
  return obj[key]
}

function byIdPath (array: any[], idPath: string, idValue: string, valueToInsert?: any) {
  let idx = idPath ? keyToIndex(array, idPath, idValue) : idValue
  if (valueToInsert === _delete_) {
    if (!idPath) {
      delete array[idx]
    } else {
      array.splice(idx, 1)
    }
    return null
  } else if (valueToInsert === _newObject_) {
    if (!idPath && !array[idx]) {
      array[idx] = {}
    }
  } else if (valueToInsert) {
    if (idx !== undefined) {
      array[idx] = valueToInsert
    } else if (idPath && getByPath(valueToInsert, idPath) + '' === idValue + '') {
      array.push(valueToInsert)
      idx = array.length - 1
    } else {
      throw new Error(`byIdPath insert failed at [${idPath}=${idValue}]`)
    }
  }
  return array[idx]
}

function expectArray (obj: any) {
  if (!Array.isArray(obj)) {
    throw makeError('setByPath failed: expected array, found', obj)
  }
}

function expectObject (obj: any) {
  if (!obj || obj.constructor !== Object) {
    throw makeError('setByPath failed: expected Object, found', obj)
  }
}

function getByPath (obj: XinObject, path: string) {
  const parts = pathParts(path)
  var found = obj
  var i, iMax, j, jMax
  for (i = 0, iMax = parts.length; found && i < iMax; i++) {
    var part = parts[i]
    if (Array.isArray(part)) {
      for (j = 0, jMax = part.length; found && j < jMax; j++) {
        var key = part[j]
        found = found[key]
      }
    } else {
      if (!found.length) {
        if (part[0] === '=') {
          found = found[part.substr(1)]
        } else {
          return null
        }
      } else if (part.indexOf('=') > -1) {
        const [idPath, ...tail] = part.split('=')
        found = byIdPath(found as any[], idPath, tail.join('='))
      } else {
        j = parseInt(part, 10)
        found = found[j]
      }
    }
  }
  return found === undefined ? null : found
}

function setByPath (orig: XinObject, path: string, val: any) {
  let obj = orig
  const parts = pathParts(path)

  while (obj && parts.length) {
    const part = parts.shift()
    if (typeof part === 'string') {
      const equalsOffset = part.indexOf('=')
      if (equalsOffset > -1) {
        if (equalsOffset === 0) {
          expectObject(obj)
        } else {
          expectArray(obj)
        }
        const idPath = part.substr(0, equalsOffset)
        const idValue = part.substr(equalsOffset + 1)
        obj = byIdPath(obj as any[], idPath, idValue, parts.length ? _newObject_ : val)
        if (!parts.length) {
          return true
        }
      } else {
        expectArray(obj)
        const idx = parseInt(part, 10)
        if (parts.length) {
          obj = obj[idx]
        } else {
          if (val !== _delete_) {
            obj[idx] = val
          } else {
            obj.splice(idx, 1)
          }
          return true
        }
      }
    } else if (Array.isArray(part) && part.length) {
      expectObject(obj)
      while (part.length) {
        const key = part.shift()
        if (part.length || parts.length) {
          // if we're at the end of part.length then we need to insert an array
          obj = byKey(obj, key, part.length ? {} : [])
        } else {
          if (val !== _delete_) {
            obj[key] = val
          } else {
            delete obj[key]
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

function deleteByPath (orig: XinObject, path: string) {
  if (getByPath(orig, path) !== null) {
    setByPath(orig, path, _delete_)
  }
}

export { getByPath, setByPath, deleteByPath, pathParts }
