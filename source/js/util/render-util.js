/*
 * Render Util
 * Methods to render a JS object
 *
 */

var renderUtil = {
  render: function(obj, objectMap) {
    var domFragment = renderUtil.buildObjEl(obj, undefined, undefined, objectMap);
    return domUtil.append(domUtil.createEl('div', 'tangible-object'), domFragment);
  },

  buildObjEl: function(val, key, jsonPath, objectMap) {
    // If we're not at the root, then we need to add a /
    jsonPath = jsonPath !== '/' ? jsonPath + '/' : jsonPath;

    // If we've got a key, then we need to update the jsonPath
    jsonPath = (key !== undefined) ? jsonPath + key : '';

    // The jsonPath for the object up to this point
    jsonPath = jsonPath || '/';

    var type = valueUtil.type(val);
    var domFragment = domUtil.createEl('span', 'entry-block');

    var wrapperDom = renderUtil.buildWrapper(val);
    var arrowDom = renderUtil.buildArrow(val, key, type);
    var keyDom = renderUtil.buildKey(val, key, type);
    var valueDom = renderUtil.buildValue(val, key, type, jsonPath, objectMap);

    var comma = domUtil.template('comma');
    var length = valueUtil.length(val);
    var countNode;
    if (length !== undefined) {
      countNode = domUtil.createEl('span', 'count', renderUtil.lengthString(length));
    }

    // Save the node to our array
    var data = {
      entryNode: wrapperDom,
      arrowNode: arrowDom,
      valueNode: valueDom,
      keyNode: keyDom,
      type: type,
      value: val,
      countNode: countNode
    };
    objectMap[jsonPath] = data;
    
    // Append our key and value to the wrapper
    wrapperDom = domUtil.append(wrapperDom, arrowDom, keyDom, valueDom);

    domFragment = domUtil.append(domFragment, wrapperDom, comma, countNode);

    return domFragment;
  },

  buildWrapper: function(val) {
    var className = valueUtil.isEmpty(val) ? 'entry empty' : 'entry';
    var wrapperDom = domUtil.createEl('span', className);
    return wrapperDom;
  },

  buildArrow: function(val, type) {
    return (valueUtil.isList(val)) ? domUtil.template('arrow') : undefined;
  },

  buildKey: function(val, key, type) {
    // If we have no key or if it's numeric, then we do not need to display it
    if (key === undefined || valueUtil.isNumeric(key)) {
      return;
    }

    var keyDom = domUtil.createEl('span', 'key');

    // Set the text of the key into a node
    var keyText = domUtil.template('key');
    keyText = domUtil.setText(keyText, key);
    // Wrap the node in quotes
    keyDom = domUtil.wrap(keyDom, keyText, 'quote');
    // Add a separator
    keyDom = domUtil.append(keyDom, domUtil.template('sep'));

    return keyDom;
  },

  buildValue: function(val, key, type, jsonPath, objectMap) {
    var valueDom = domUtil.createEl('span', 'value');

    type = type || valueUtil.type(val);

    var methodName = 'build'+util.capitalize(type)+'Dom';
    var innerNode;

    if (typeof renderUtil[methodName] === 'function') {
      innerNode = renderUtil[methodName](val, key, type, jsonPath, objectMap);
    }

    valueDom = domUtil.append(valueDom, innerNode);

    return valueDom;
  },

  buildStringDom: function(val, key, type, jsonPath) {
    var fragment = domUtil.fragment();

    // Get our value in text form
    var valText = JSON.stringify(val);
    valText = valText.substring(1, valText.length - 1);

    // Create a new string element, and set its text
    var stringEl = domUtil.template('string');
    stringEl = domUtil.setText(stringEl, valText);

    // Add quotes to it and we're done
    fragment = domUtil.wrap(fragment, stringEl, 'quote');

    return fragment;
  },

  buildNullDom: function() {
    return renderUtil._buildFlatValue.apply(this, arguments);
  },

  buildUndefinedDom: function() {
    return renderUtil._buildFlatValue.apply(this, arguments);
  },

  buildNumberDom: function() {
    return renderUtil._buildFlatValue.apply(this, arguments);
  },

  buildRegexDom: function() {
    return renderUtil._buildFlatValue.apply(this, arguments);
  },

  buildBooleanDom: function() {
    return renderUtil._buildFlatValue.apply(this, arguments);
  },

  _buildFlatValue: function(val, key, type) {
    var valText = String(val);
    if (val === null) {
      valText = 'null';
    } else if (val === undefined) {
      valText = 'undefined';
    }

    return domUtil.createEl('span', type, valText);
  },

  buildObjectDom: function() {
    return renderUtil._buildListValue.apply(this, arguments);
  },

  buildArrayDom: function() {
    return renderUtil._buildListValue.apply(this, arguments);
  },

  _buildListValue: function(val, key, type, jsonPath, objectMap) {
    var bracketType = type === 'array' ? 'bracket' : 'brace';
    var fragment = domUtil.fragment();
    // Start by adding the open bracket and ellipsis
    fragment = domUtil.append(fragment, domUtil.template(bracketType+'Open'), domUtil.template('ellipsis'));
    var entryList = domUtil.template('entryList');

    // Recursively build the child nodes as well
    var childEl;
    util.each(val, function(childVal, childKey) {
      childEl = renderUtil.buildObjEl(childVal, childKey, jsonPath, objectMap);
      entryList = domUtil.append(entryList, childEl);
    });

    // Attach the list, close the bracket and we're done
    fragment = domUtil.append(fragment, entryList, domUtil.template(bracketType+'Close'));
    return fragment;
  },

  lengthString: function(length) {
    var plural = length === 1 ? '' : 's';
    return ' // ' + length + ' item' + plural;
  },
};
