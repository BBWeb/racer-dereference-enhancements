# racer-dereference-enhancements
Racer/Derby plugin for enhanced deference functionality

How to use
==========
After adding the plugin:
```javascript
derby.use(require('racer-dereference-enhancements'));
```

Use it according to it's expanded API, see below:

API
========
/**
 * Dereferences the path.
 *
 * @param {String} [subpath] - A subpath to append to the current scope
 * @param {Number} [levels] - The number of levels of dereferencing to do. Default: Dereference all the way to the original path.
 * @param {Object} [options] - An options object.
 * @param {Boolean} [options.forArrayMutator] - If derefence should traverse refLists on the refList array level
 * @param {RefList} [options.ignore] - A refList to ignore when traversing
 */
