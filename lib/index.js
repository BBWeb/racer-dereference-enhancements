module.exports = function (racer) {
  var Model = racer.Model;

  /**
   * Dereferences the path.
   *
   * @param {String} [subpath] - A subpath to append to the current scope
   * @param {Number} [levels] - The number of levels of dereferencing to do. Default: Dereference all the way to the original path.
   * @param {Object} [options] - An options object.
   * @param {Boolean} [options.forArrayMutator] - If derefence should traverse refLists on the refList array level
   * @param {RefList} [options.ignore] - A refList to ignore when traversing
   */
  Model.prototype.dereference = function(subpath, levels, options) {
    var args = Array.prototype.slice.call(arguments);
    var arg = args.shift();
    var subpath = '';
    var levels;

    if(typeof arg === 'string' || arg instanceof Model) {
      subpath = arg;
      arg = args.shift();
    }

    if(typeof arg === 'number') {
      levels = arg;
      arg = args.shift();
    }

    var options = arg || {};

    var segments = this._splitPath(subpath);
    var forArrayMutator = options.forArrayMutator;
    var ignore = options.ignore;

    var resolved = this._dereference(segments, forArrayMutator, ignore, levels).join('.');

    // TODO: Eventually, a better API would be to always return a scoped model (albeit keeping _dereference returning a segments array for Racer internal purposes)
    if(options.scoped) return this.scope(resolved);

    return resolved;
  };

  Model.prototype._dereference = function(segments, forArrayMutator, ignore, levels) {
    if (segments.length === 0 || levels === 0) return segments;
    var refs = this.root._refs.fromPathMap;
    var refLists = this.root._refLists.fromMap;
    var doAgain;
    var j = 0;
    do {
      var subpath = '';
      doAgain = false;
      for (var i = 0, len = segments.length; i < len; i++) {
        subpath = (subpath) ? subpath + '.' + segments[i] : segments[i];

        var ref = refs.get(subpath.split('.'));
        if (ref) {
          var remaining = segments.slice(i + 1);
          segments = ref.toSegments.concat(remaining);
          doAgain = true;
          break;
        }

        var refList = refLists[subpath];
        if (refList && refList !== ignore) {
          var belowDescendant = i + 2 < len;
          var belowChild = i + 1 < len;
          if (!(belowDescendant || forArrayMutator && belowChild)) continue;
          // TODO: Review what to do with continue and we also need to implement dereference with level parameter for refLists
          segments = refList.dereference(segments, i);
          doAgain = true;
          break;
        }
      }

      j++;
    } while (doAgain && (!levels || levels > j));
    // If a dereference fails, return a path that will result in a null value
    // instead of a path to everything in the model
    if (segments.length === 0) return ['$null'];
    return segments;
  };
};
