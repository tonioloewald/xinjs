// @ts-ignore
import { test, expect } from 'bun:test';
import { xin, observe, unobserve, touch } from './xin';
const changes = [];
const obj = {
    message: 'hello xin',
    value: 17,
    people: ['tomasina', 'juanita', 'harriet'],
    things: [
        { id: 1701, name: 'Enterprise' },
        { id: 666, name: 'The Beast' },
        { id: 1, name: 'The Best' }
    ],
    cb(path) {
        if (path !== 'test.changes')
            changes.push({ path, value: xin[path] });
    },
    sub: {
        foo: 'bar'
    }
};
xin.test = obj;
test('recovers simple values', () => {
    expect(xin.test.message).toBe('hello xin');
    expect(xin.test.value).toBe(17);
});
test('handles arrays', () => {
    expect(xin.test.people[0]).toBe('tomasina');
    expect(xin.test.things['id=1701'].name).toBe('Enterprise');
});
test('updates simple values', () => {
    xin.test.message = 'xin rules';
    xin.test.value++;
    expect(xin.test.message).toBe('xin rules');
    expect(xin.test.value).toBe(18);
});
test('triggers listeners', () => {
    changes.splice(0);
    const listener = observe('test', (path) => {
        changes.push({ path, value: xin[path] });
    });
    xin.test.value = Math.PI;
    expect(changes.length).toBe(1);
    expect(changes[0].path).toBe('test.value');
    expect(changes[0].value).toBe(Math.PI);
    xin.test.message = 'kiss me xin';
    expect(changes.length).toBe(2);
    expect(changes[1].path).toBe('test.message');
    expect(changes[1].value).toBe('kiss me xin');
    xin.test.things['id=1701'].name = 'formerly known as Enterprise';
    expect(changes.length).toBe(3);
    expect(changes[2].path).toBe('test.things[id=1701].name');
    expect(changes[2].value).toBe('formerly known as Enterprise');
    xin.test.people.sort();
    // expect sort to trigger change
    expect(changes.length).toBe(4);
    expect(changes[3].path).toBe('test.people');
    // expect map to NOT trigger change
    const ignore = xin.test.people.map((person) => `hello ${person}`);
    expect(changes.length).toBe(4);
    unobserve(listener);
});
test('listener paths are selective', () => {
    changes.splice(0);
    const listener = observe('test.value', (path) => {
        changes.push({ path, value: xin[path] });
    });
    xin.test.message = 'ignore this';
    xin.test.value = Math.random();
    expect(changes.length).toBe(1);
    unobserve(listener);
});
test('listener tests are selective', () => {
    changes.splice(0);
    const listener = observe(/message/, (path) => {
        changes.push({ path, value: xin[path] });
    });
    xin.test.message = 'hello';
    xin.test.value = Math.random();
    xin.test.message = 'good-bye';
    xin.test.value = Math.random();
    expect(changes.length).toBe(2);
    unobserve(listener);
});
test('listener callback paths work', () => {
    changes.splice(0);
    const listener = observe('test', 'test.cb');
    xin.test.message = 'hello';
    xin.test.value = Math.random();
    xin.test.message = 'good-bye';
    xin.test.value = Math.random();
    expect(changes.length).toBe(4);
    unobserve(listener);
});
test('you can touch objects', () => {
    changes.splice(0);
    const listener = observe('test', path => {
        changes.push({ path, value: xin[path] });
    });
    xin.test._xinValue.message = 'wham-o';
    expect(xin.test.message).toBe('wham-o');
    expect(changes.length).toBe(0);
    touch(xin.test);
    expect(changes.length).toBe(1);
    xin.test.message = 'because';
    expect(changes.length).toBe(2);
    xin.test._xinValue.message = 'i said so';
    expect(changes.length).toBe(2);
    touch('test.message');
    expect(changes.length).toBe(3);
    expect(changes[2].value).toBe('i said so');
    unobserve(listener);
});
test('instance changes trigger observers', () => {
    changes.splice(0);
    class Baz {
        constructor(x = 0) {
            this.x = 0;
            this.x = x;
        }
        get y() {
            return this.x;
        }
        set y(newValue) {
            this.x = newValue;
        }
    }
    const baz = new Baz(17);
    xin.test.baz = baz;
    const listener = observe(() => true, (path) => {
        changes.push({ path, value: xin[path] });
    });
    expect(xin.test.baz._xinValue).toBe(baz);
    expect(xin.test.baz.x).toBe(17);
    expect(xin.test.baz.y).toBe(17);
    expect(changes.length).toBe(0);
    xin.test.baz.x = 100;
    expect(changes.length).toBe(1);
    expect(changes[0].path).toBe('test.baz.x');
    xin.test.baz.x = 100;
    expect(changes.length).toBe(1);
    xin.test.baz.y = 100;
    expect(changes.length).toBe(1);
    expect(changes[0].path).toBe('test.baz.x');
    xin.test.baz.y = Math.PI;
    expect(changes.length).toBe(2);
    expect(changes[1].path).toBe('test.baz.y');
    unobserve(listener);
});
test('handles array changes', () => {
    changes.splice(0);
    const listener = observe('test', (path) => {
        changes.push({ path, value: xin[path] });
    });
    xin.test.people.push('stanton');
    expect(changes.length).toBe(1);
    expect(changes[0].path).toBe('test.people');
    xin.test.people.sort();
    expect(changes.length).toBe(2);
    expect(changes[1].path).toBe('test.people');
    unobserve(listener);
});
test('objects are replaced', () => {
    expect(xin.test.sub.foo).toBe('bar');
    xin.test.sub = {
        bar: 'baz'
    };
    expect(xin.test.sub.foo).toBe(undefined);
    expect(xin.test.sub.bar).toBe('baz');
});
test('unobserve works', () => {
    changes.splice(0);
    const listener = observe('test', (path) => {
        changes.push({ path, value: xin[path] });
    });
    xin.test.value = Math.random();
    expect(changes.length).toBe(1);
    unobserve(listener);
    xin.test.things['id=1701'].name = 'Enterprise II';
    xin.test.value = 0;
    expect(changes.length).toBe(1);
});
test('_xinPath works', () => {
    expect(xin.test._xinPath).toBe('test');
    expect(xin.test.people._xinPath).toBe('test.people');
    expect(xin.test.things['id=666']._xinPath).toBe('test.things[id=666]');
});
test('_xinValue works, xin does not corrupt content', () => {
    expect(xin.test._xinValue).toBe(obj);
    expect(xin.test.people._xinValue).toBe(obj.people);
    expect(xin.test.things['id=666']._xinValue).toBe(obj.things[1]);
});
test('instance properties, computed properties', () => {
    class Foo {
        constructor(x) {
            this.x = '';
            this.x = x;
        }
        get computedX() {
            return this.x;
        }
    }
    xin.foo = new Foo('test');
    expect(xin.foo.x).toBe('test');
    expect(xin.foo.computedX).toBe('test');
});
test('parents and children', () => {
    xin.grandparent = {
        name: 'Bobby',
        parent: { child: 17 }
    };
    changes.splice(0);
    observe('grandparent.parent', path => {
        changes.push({ path, value: xin[path], observed: 'parent' });
    });
    observe('grandparent.parent.child', path => {
        changes.push({ path, value: xin[path], observed: 'parent.child' });
    });
    xin.grandparent.parent = { child: 20 };
    expect(changes.length).toBe(2);
    xin.grandparent.parent.child = 20;
    expect(changes.length).toBe(2);
    xin.grandparent.parent.child = 17;
    expect(changes.length).toBe(4);
    xin.grandparent.parent = { child: 11 };
    expect(changes.length).toBe(6);
    xin.grandparent.name = 'Drop Tables';
    expect(changes.length).toBe(6);
});
