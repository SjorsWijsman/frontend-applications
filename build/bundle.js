
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.7' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var xhtml = "http://www.w3.org/1999/xhtml";

    var namespaces = {
      svg: "http://www.w3.org/2000/svg",
      xhtml: xhtml,
      xlink: "http://www.w3.org/1999/xlink",
      xml: "http://www.w3.org/XML/1998/namespace",
      xmlns: "http://www.w3.org/2000/xmlns/"
    };

    function namespace(name) {
      var prefix = name += "", i = prefix.indexOf(":");
      if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
      return namespaces.hasOwnProperty(prefix) ? {space: namespaces[prefix], local: name} : name; // eslint-disable-line no-prototype-builtins
    }

    function creatorInherit(name) {
      return function() {
        var document = this.ownerDocument,
            uri = this.namespaceURI;
        return uri === xhtml && document.documentElement.namespaceURI === xhtml
            ? document.createElement(name)
            : document.createElementNS(uri, name);
      };
    }

    function creatorFixed(fullname) {
      return function() {
        return this.ownerDocument.createElementNS(fullname.space, fullname.local);
      };
    }

    function creator(name) {
      var fullname = namespace(name);
      return (fullname.local
          ? creatorFixed
          : creatorInherit)(fullname);
    }

    function none() {}

    function selector(selector) {
      return selector == null ? none : function() {
        return this.querySelector(selector);
      };
    }

    function selection_select(select) {
      if (typeof select !== "function") select = selector(select);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
          if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
            if ("__data__" in node) subnode.__data__ = node.__data__;
            subgroup[i] = subnode;
          }
        }
      }

      return new Selection(subgroups, this._parents);
    }

    function array(x) {
      return typeof x === "object" && "length" in x
        ? x // Array, TypedArray, NodeList, array-like
        : Array.from(x); // Map, Set, iterable, string, or anything else
    }

    function empty() {
      return [];
    }

    function selectorAll(selector) {
      return selector == null ? empty : function() {
        return this.querySelectorAll(selector);
      };
    }

    function arrayAll(select) {
      return function() {
        var group = select.apply(this, arguments);
        return group == null ? [] : array(group);
      };
    }

    function selection_selectAll(select) {
      if (typeof select === "function") select = arrayAll(select);
      else select = selectorAll(select);

      for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            subgroups.push(select.call(node, node.__data__, i, group));
            parents.push(node);
          }
        }
      }

      return new Selection(subgroups, parents);
    }

    function matcher(selector) {
      return function() {
        return this.matches(selector);
      };
    }

    function childMatcher(selector) {
      return function(node) {
        return node.matches(selector);
      };
    }

    var find = Array.prototype.find;

    function childFind(match) {
      return function() {
        return find.call(this.children, match);
      };
    }

    function childFirst() {
      return this.firstElementChild;
    }

    function selection_selectChild(match) {
      return this.select(match == null ? childFirst
          : childFind(typeof match === "function" ? match : childMatcher(match)));
    }

    var filter = Array.prototype.filter;

    function children$1() {
      return this.children;
    }

    function childrenFilter(match) {
      return function() {
        return filter.call(this.children, match);
      };
    }

    function selection_selectChildren(match) {
      return this.selectAll(match == null ? children$1
          : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
    }

    function selection_filter(match) {
      if (typeof match !== "function") match = matcher(match);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
          if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
            subgroup.push(node);
          }
        }
      }

      return new Selection(subgroups, this._parents);
    }

    function sparse(update) {
      return new Array(update.length);
    }

    function selection_enter() {
      return new Selection(this._enter || this._groups.map(sparse), this._parents);
    }

    function EnterNode(parent, datum) {
      this.ownerDocument = parent.ownerDocument;
      this.namespaceURI = parent.namespaceURI;
      this._next = null;
      this._parent = parent;
      this.__data__ = datum;
    }

    EnterNode.prototype = {
      constructor: EnterNode,
      appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
      insertBefore: function(child, next) { return this._parent.insertBefore(child, next); },
      querySelector: function(selector) { return this._parent.querySelector(selector); },
      querySelectorAll: function(selector) { return this._parent.querySelectorAll(selector); }
    };

    function constant(x) {
      return function() {
        return x;
      };
    }

    function bindIndex(parent, group, enter, update, exit, data) {
      var i = 0,
          node,
          groupLength = group.length,
          dataLength = data.length;

      // Put any non-null nodes that fit into update.
      // Put any null nodes into enter.
      // Put any remaining data into enter.
      for (; i < dataLength; ++i) {
        if (node = group[i]) {
          node.__data__ = data[i];
          update[i] = node;
        } else {
          enter[i] = new EnterNode(parent, data[i]);
        }
      }

      // Put any non-null nodes that don’t fit into exit.
      for (; i < groupLength; ++i) {
        if (node = group[i]) {
          exit[i] = node;
        }
      }
    }

    function bindKey(parent, group, enter, update, exit, data, key) {
      var i,
          node,
          nodeByKeyValue = new Map,
          groupLength = group.length,
          dataLength = data.length,
          keyValues = new Array(groupLength),
          keyValue;

      // Compute the key for each node.
      // If multiple nodes have the same key, the duplicates are added to exit.
      for (i = 0; i < groupLength; ++i) {
        if (node = group[i]) {
          keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
          if (nodeByKeyValue.has(keyValue)) {
            exit[i] = node;
          } else {
            nodeByKeyValue.set(keyValue, node);
          }
        }
      }

      // Compute the key for each datum.
      // If there a node associated with this key, join and add it to update.
      // If there is not (or the key is a duplicate), add it to enter.
      for (i = 0; i < dataLength; ++i) {
        keyValue = key.call(parent, data[i], i, data) + "";
        if (node = nodeByKeyValue.get(keyValue)) {
          update[i] = node;
          node.__data__ = data[i];
          nodeByKeyValue.delete(keyValue);
        } else {
          enter[i] = new EnterNode(parent, data[i]);
        }
      }

      // Add any remaining nodes that were not bound to data to exit.
      for (i = 0; i < groupLength; ++i) {
        if ((node = group[i]) && (nodeByKeyValue.get(keyValues[i]) === node)) {
          exit[i] = node;
        }
      }
    }

    function datum(node) {
      return node.__data__;
    }

    function selection_data(value, key) {
      if (!arguments.length) return Array.from(this, datum);

      var bind = key ? bindKey : bindIndex,
          parents = this._parents,
          groups = this._groups;

      if (typeof value !== "function") value = constant(value);

      for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
        var parent = parents[j],
            group = groups[j],
            groupLength = group.length,
            data = array(value.call(parent, parent && parent.__data__, j, parents)),
            dataLength = data.length,
            enterGroup = enter[j] = new Array(dataLength),
            updateGroup = update[j] = new Array(dataLength),
            exitGroup = exit[j] = new Array(groupLength);

        bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

        // Now connect the enter nodes to their following update node, such that
        // appendChild can insert the materialized enter node before this node,
        // rather than at the end of the parent node.
        for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
          if (previous = enterGroup[i0]) {
            if (i0 >= i1) i1 = i0 + 1;
            while (!(next = updateGroup[i1]) && ++i1 < dataLength);
            previous._next = next || null;
          }
        }
      }

      update = new Selection(update, parents);
      update._enter = enter;
      update._exit = exit;
      return update;
    }

    function selection_exit() {
      return new Selection(this._exit || this._groups.map(sparse), this._parents);
    }

    function selection_join(onenter, onupdate, onexit) {
      var enter = this.enter(), update = this, exit = this.exit();
      enter = typeof onenter === "function" ? onenter(enter) : enter.append(onenter + "");
      if (onupdate != null) update = onupdate(update);
      if (onexit == null) exit.remove(); else onexit(exit);
      return enter && update ? enter.merge(update).order() : update;
    }

    function selection_merge(selection) {
      if (!(selection instanceof Selection)) throw new Error("invalid merge");

      for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
        for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
          if (node = group0[i] || group1[i]) {
            merge[i] = node;
          }
        }
      }

      for (; j < m0; ++j) {
        merges[j] = groups0[j];
      }

      return new Selection(merges, this._parents);
    }

    function selection_order() {

      for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
        for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
          if (node = group[i]) {
            if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
            next = node;
          }
        }
      }

      return this;
    }

    function selection_sort(compare) {
      if (!compare) compare = ascending;

      function compareNode(a, b) {
        return a && b ? compare(a.__data__, b.__data__) : !a - !b;
      }

      for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            sortgroup[i] = node;
          }
        }
        sortgroup.sort(compareNode);
      }

      return new Selection(sortgroups, this._parents).order();
    }

    function ascending(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function selection_call() {
      var callback = arguments[0];
      arguments[0] = this;
      callback.apply(null, arguments);
      return this;
    }

    function selection_nodes() {
      return Array.from(this);
    }

    function selection_node() {

      for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
        for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
          var node = group[i];
          if (node) return node;
        }
      }

      return null;
    }

    function selection_size() {
      let size = 0;
      for (const node of this) ++size; // eslint-disable-line no-unused-vars
      return size;
    }

    function selection_empty() {
      return !this.node();
    }

    function selection_each(callback) {

      for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
        for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
          if (node = group[i]) callback.call(node, node.__data__, i, group);
        }
      }

      return this;
    }

    function attrRemove(name) {
      return function() {
        this.removeAttribute(name);
      };
    }

    function attrRemoveNS(fullname) {
      return function() {
        this.removeAttributeNS(fullname.space, fullname.local);
      };
    }

    function attrConstant(name, value) {
      return function() {
        this.setAttribute(name, value);
      };
    }

    function attrConstantNS(fullname, value) {
      return function() {
        this.setAttributeNS(fullname.space, fullname.local, value);
      };
    }

    function attrFunction(name, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) this.removeAttribute(name);
        else this.setAttribute(name, v);
      };
    }

    function attrFunctionNS(fullname, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
        else this.setAttributeNS(fullname.space, fullname.local, v);
      };
    }

    function selection_attr(name, value) {
      var fullname = namespace(name);

      if (arguments.length < 2) {
        var node = this.node();
        return fullname.local
            ? node.getAttributeNS(fullname.space, fullname.local)
            : node.getAttribute(fullname);
      }

      return this.each((value == null
          ? (fullname.local ? attrRemoveNS : attrRemove) : (typeof value === "function"
          ? (fullname.local ? attrFunctionNS : attrFunction)
          : (fullname.local ? attrConstantNS : attrConstant)))(fullname, value));
    }

    function defaultView(node) {
      return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
          || (node.document && node) // node is a Window
          || node.defaultView; // node is a Document
    }

    function styleRemove(name) {
      return function() {
        this.style.removeProperty(name);
      };
    }

    function styleConstant(name, value, priority) {
      return function() {
        this.style.setProperty(name, value, priority);
      };
    }

    function styleFunction(name, value, priority) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) this.style.removeProperty(name);
        else this.style.setProperty(name, v, priority);
      };
    }

    function selection_style(name, value, priority) {
      return arguments.length > 1
          ? this.each((value == null
                ? styleRemove : typeof value === "function"
                ? styleFunction
                : styleConstant)(name, value, priority == null ? "" : priority))
          : styleValue(this.node(), name);
    }

    function styleValue(node, name) {
      return node.style.getPropertyValue(name)
          || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
    }

    function propertyRemove(name) {
      return function() {
        delete this[name];
      };
    }

    function propertyConstant(name, value) {
      return function() {
        this[name] = value;
      };
    }

    function propertyFunction(name, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) delete this[name];
        else this[name] = v;
      };
    }

    function selection_property(name, value) {
      return arguments.length > 1
          ? this.each((value == null
              ? propertyRemove : typeof value === "function"
              ? propertyFunction
              : propertyConstant)(name, value))
          : this.node()[name];
    }

    function classArray(string) {
      return string.trim().split(/^|\s+/);
    }

    function classList(node) {
      return node.classList || new ClassList(node);
    }

    function ClassList(node) {
      this._node = node;
      this._names = classArray(node.getAttribute("class") || "");
    }

    ClassList.prototype = {
      add: function(name) {
        var i = this._names.indexOf(name);
        if (i < 0) {
          this._names.push(name);
          this._node.setAttribute("class", this._names.join(" "));
        }
      },
      remove: function(name) {
        var i = this._names.indexOf(name);
        if (i >= 0) {
          this._names.splice(i, 1);
          this._node.setAttribute("class", this._names.join(" "));
        }
      },
      contains: function(name) {
        return this._names.indexOf(name) >= 0;
      }
    };

    function classedAdd(node, names) {
      var list = classList(node), i = -1, n = names.length;
      while (++i < n) list.add(names[i]);
    }

    function classedRemove(node, names) {
      var list = classList(node), i = -1, n = names.length;
      while (++i < n) list.remove(names[i]);
    }

    function classedTrue(names) {
      return function() {
        classedAdd(this, names);
      };
    }

    function classedFalse(names) {
      return function() {
        classedRemove(this, names);
      };
    }

    function classedFunction(names, value) {
      return function() {
        (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
      };
    }

    function selection_classed(name, value) {
      var names = classArray(name + "");

      if (arguments.length < 2) {
        var list = classList(this.node()), i = -1, n = names.length;
        while (++i < n) if (!list.contains(names[i])) return false;
        return true;
      }

      return this.each((typeof value === "function"
          ? classedFunction : value
          ? classedTrue
          : classedFalse)(names, value));
    }

    function textRemove() {
      this.textContent = "";
    }

    function textConstant(value) {
      return function() {
        this.textContent = value;
      };
    }

    function textFunction(value) {
      return function() {
        var v = value.apply(this, arguments);
        this.textContent = v == null ? "" : v;
      };
    }

    function selection_text(value) {
      return arguments.length
          ? this.each(value == null
              ? textRemove : (typeof value === "function"
              ? textFunction
              : textConstant)(value))
          : this.node().textContent;
    }

    function htmlRemove() {
      this.innerHTML = "";
    }

    function htmlConstant(value) {
      return function() {
        this.innerHTML = value;
      };
    }

    function htmlFunction(value) {
      return function() {
        var v = value.apply(this, arguments);
        this.innerHTML = v == null ? "" : v;
      };
    }

    function selection_html(value) {
      return arguments.length
          ? this.each(value == null
              ? htmlRemove : (typeof value === "function"
              ? htmlFunction
              : htmlConstant)(value))
          : this.node().innerHTML;
    }

    function raise() {
      if (this.nextSibling) this.parentNode.appendChild(this);
    }

    function selection_raise() {
      return this.each(raise);
    }

    function lower() {
      if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
    }

    function selection_lower() {
      return this.each(lower);
    }

    function selection_append(name) {
      var create = typeof name === "function" ? name : creator(name);
      return this.select(function() {
        return this.appendChild(create.apply(this, arguments));
      });
    }

    function constantNull() {
      return null;
    }

    function selection_insert(name, before) {
      var create = typeof name === "function" ? name : creator(name),
          select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
      return this.select(function() {
        return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
      });
    }

    function remove() {
      var parent = this.parentNode;
      if (parent) parent.removeChild(this);
    }

    function selection_remove() {
      return this.each(remove);
    }

    function selection_cloneShallow() {
      var clone = this.cloneNode(false), parent = this.parentNode;
      return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
    }

    function selection_cloneDeep() {
      var clone = this.cloneNode(true), parent = this.parentNode;
      return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
    }

    function selection_clone(deep) {
      return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
    }

    function selection_datum(value) {
      return arguments.length
          ? this.property("__data__", value)
          : this.node().__data__;
    }

    function contextListener(listener) {
      return function(event) {
        listener.call(this, event, this.__data__);
      };
    }

    function parseTypenames(typenames) {
      return typenames.trim().split(/^|\s+/).map(function(t) {
        var name = "", i = t.indexOf(".");
        if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
        return {type: t, name: name};
      });
    }

    function onRemove(typename) {
      return function() {
        var on = this.__on;
        if (!on) return;
        for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
          if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
            this.removeEventListener(o.type, o.listener, o.options);
          } else {
            on[++i] = o;
          }
        }
        if (++i) on.length = i;
        else delete this.__on;
      };
    }

    function onAdd(typename, value, options) {
      return function() {
        var on = this.__on, o, listener = contextListener(value);
        if (on) for (var j = 0, m = on.length; j < m; ++j) {
          if ((o = on[j]).type === typename.type && o.name === typename.name) {
            this.removeEventListener(o.type, o.listener, o.options);
            this.addEventListener(o.type, o.listener = listener, o.options = options);
            o.value = value;
            return;
          }
        }
        this.addEventListener(typename.type, listener, options);
        o = {type: typename.type, name: typename.name, value: value, listener: listener, options: options};
        if (!on) this.__on = [o];
        else on.push(o);
      };
    }

    function selection_on(typename, value, options) {
      var typenames = parseTypenames(typename + ""), i, n = typenames.length, t;

      if (arguments.length < 2) {
        var on = this.node().__on;
        if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
          for (i = 0, o = on[j]; i < n; ++i) {
            if ((t = typenames[i]).type === o.type && t.name === o.name) {
              return o.value;
            }
          }
        }
        return;
      }

      on = value ? onAdd : onRemove;
      for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
      return this;
    }

    function dispatchEvent(node, type, params) {
      var window = defaultView(node),
          event = window.CustomEvent;

      if (typeof event === "function") {
        event = new event(type, params);
      } else {
        event = window.document.createEvent("Event");
        if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
        else event.initEvent(type, false, false);
      }

      node.dispatchEvent(event);
    }

    function dispatchConstant(type, params) {
      return function() {
        return dispatchEvent(this, type, params);
      };
    }

    function dispatchFunction(type, params) {
      return function() {
        return dispatchEvent(this, type, params.apply(this, arguments));
      };
    }

    function selection_dispatch(type, params) {
      return this.each((typeof params === "function"
          ? dispatchFunction
          : dispatchConstant)(type, params));
    }

    function* selection_iterator() {
      for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
        for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
          if (node = group[i]) yield node;
        }
      }
    }

    var root = [null];

    function Selection(groups, parents) {
      this._groups = groups;
      this._parents = parents;
    }

    function selection() {
      return new Selection([[document.documentElement]], root);
    }

    function selection_selection() {
      return this;
    }

    Selection.prototype = selection.prototype = {
      constructor: Selection,
      select: selection_select,
      selectAll: selection_selectAll,
      selectChild: selection_selectChild,
      selectChildren: selection_selectChildren,
      filter: selection_filter,
      data: selection_data,
      enter: selection_enter,
      exit: selection_exit,
      join: selection_join,
      merge: selection_merge,
      selection: selection_selection,
      order: selection_order,
      sort: selection_sort,
      call: selection_call,
      nodes: selection_nodes,
      node: selection_node,
      size: selection_size,
      empty: selection_empty,
      each: selection_each,
      attr: selection_attr,
      style: selection_style,
      property: selection_property,
      classed: selection_classed,
      text: selection_text,
      html: selection_html,
      raise: selection_raise,
      lower: selection_lower,
      append: selection_append,
      insert: selection_insert,
      remove: selection_remove,
      clone: selection_clone,
      datum: selection_datum,
      on: selection_on,
      dispatch: selection_dispatch,
      [Symbol.iterator]: selection_iterator
    };

    function select(selector) {
      return typeof selector === "string"
          ? new Selection([[document.querySelector(selector)]], [document.documentElement])
          : new Selection([[selector]], root);
    }

    function selectAll(selector) {
      return typeof selector === "string"
          ? new Selection([document.querySelectorAll(selector)], [document.documentElement])
          : new Selection([selector == null ? [] : array(selector)], root);
    }

    /* src/components/Select.svelte generated by Svelte v3.29.7 */
    const file = "src/components/Select.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (39:1) {#each selectionValues as option}
    function create_each_block(ctx) {
    	let option;
    	let t0_value = /*option*/ ctx[6].text + "";
    	let t0;
    	let t1;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*option*/ ctx[6].value;
    			option.value = option.__value;
    			add_location(option, file, 39, 2, 873);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectionValues*/ 2 && t0_value !== (t0_value = /*option*/ ctx[6].text + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*selectionValues*/ 2 && option_value_value !== (option_value_value = /*option*/ ctx[6].value)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(39:1) {#each selectionValues as option}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let select_1;
    	let mounted;
    	let dispose;
    	let each_value = /*selectionValues*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			select_1 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(select_1, "selected", /*selected*/ ctx[0]);
    			attr_dev(select_1, "class", "svelte-e5kcei");
    			if (/*selected*/ ctx[0] === void 0) add_render_callback(() => /*select_1_change_handler*/ ctx[3].call(select_1));
    			add_location(select_1, file, 37, 0, 785);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select_1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select_1, null);
    			}

    			select_option(select_1, /*selected*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(select_1, "change", /*select_1_change_handler*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*selectionValues*/ 2) {
    				each_value = /*selectionValues*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select_1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*selected, selectionValues*/ 3) {
    				attr_dev(select_1, "selected", /*selected*/ ctx[0]);
    			}

    			if (dirty & /*selected, selectionValues*/ 3) {
    				select_option(select_1, /*selected*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select_1);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Select", slots, []);
    	let { selectionValues } = $$props;
    	let { selected } = $$props;
    	let { storageKey } = $$props;

    	// Get selection from session storage
    	const storage = window.sessionStorage;

    	const storedSelection = JSON.parse(storage.getItem("data-" + storageKey));
    	if (storedSelection) selected = storedSelection;

    	// Update selection to session storage on change
    	afterUpdate(async () => {
    		storage.setItem("data-" + storageKey, JSON.stringify(selected));
    	});

    	const writable_props = ["selectionValues", "selected", "storageKey"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Select> was created with unknown prop '${key}'`);
    	});

    	function select_1_change_handler() {
    		selected = select_value(this);
    		$$invalidate(0, selected);
    		$$invalidate(1, selectionValues);
    	}

    	$$self.$$set = $$props => {
    		if ("selectionValues" in $$props) $$invalidate(1, selectionValues = $$props.selectionValues);
    		if ("selected" in $$props) $$invalidate(0, selected = $$props.selected);
    		if ("storageKey" in $$props) $$invalidate(2, storageKey = $$props.storageKey);
    	};

    	$$self.$capture_state = () => ({
    		afterUpdate,
    		select,
    		selectionValues,
    		selected,
    		storageKey,
    		storage,
    		storedSelection
    	});

    	$$self.$inject_state = $$props => {
    		if ("selectionValues" in $$props) $$invalidate(1, selectionValues = $$props.selectionValues);
    		if ("selected" in $$props) $$invalidate(0, selected = $$props.selected);
    		if ("storageKey" in $$props) $$invalidate(2, storageKey = $$props.storageKey);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selected, selectionValues, storageKey, select_1_change_handler];
    }

    class Select extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			selectionValues: 1,
    			selected: 0,
    			storageKey: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Select",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*selectionValues*/ ctx[1] === undefined && !("selectionValues" in props)) {
    			console.warn("<Select> was created without expected prop 'selectionValues'");
    		}

    		if (/*selected*/ ctx[0] === undefined && !("selected" in props)) {
    			console.warn("<Select> was created without expected prop 'selected'");
    		}

    		if (/*storageKey*/ ctx[2] === undefined && !("storageKey" in props)) {
    			console.warn("<Select> was created without expected prop 'storageKey'");
    		}
    	}

    	get selectionValues() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectionValues(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get storageKey() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set storageKey(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Tooltip.svelte generated by Svelte v3.29.7 */
    const file$1 = "src/components/Tooltip.svelte";

    function create_fragment$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Placeholder: This should not be visible";
    			attr_dev(div, "class", "tooltip svelte-1hpa1xl");
    			add_location(div, file$1, 86, 0, 1761);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tooltip", slots, []);

    	function showTooltip(e) {
    		const tooltip = select(".tooltip");

    		// Display tooltip and set to mouse location
    		tooltip.style("left", e.clientX + "px").style("top", e.clientY - tooltip.style("height").replace("px", "") + "px").transition().duration(50).style("opacity", 0.95);
    	}

    	function hideTooltip(duration = 200) {
    		const tooltip = select(".tooltip").transition().duration(duration).style("opacity", 0);
    	}

    	function setText(text) {
    		const tooltip = select(".tooltip").html("");
    		if (text.title) tooltip.append("h3").text(text.title);
    		if (text.text) tooltip.append("p").text(text.text);

    		if (text.table) {
    			const table = tooltip.append("div");
    			table.attr("class", "table");

    			for (let entry of text.table) {
    				table.append("span").text(entry[0]);
    				table.append("span").text(entry[1]);
    			}
    		}
    	}

    	// Hide tooltip on scroll to prevent tooltip from staying on screen
    	window.addEventListener("scroll", () => {
    		hideTooltip(0);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tooltip> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		select,
    		showTooltip,
    		hideTooltip,
    		setText
    	});

    	return [showTooltip, hideTooltip, setText];
    }

    class Tooltip extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			showTooltip: 0,
    			hideTooltip: 1,
    			setText: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tooltip",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get showTooltip() {
    		return this.$$.ctx[0];
    	}

    	set showTooltip(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideTooltip() {
    		return this.$$.ctx[1];
    	}

    	set hideTooltip(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setText() {
    		return this.$$.ctx[2];
    	}

    	set setText(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /*
      Convert size in px to new size in px relative to 1 rem
    */
    function relativeSize(size) {
      // Calculate rem size for calculating responsive sizes
      const remSize = select("html").style("font-size").replace("px", "");
      return size / 16 * remSize;
    }

    function ascending$1(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function bisector(f) {
      let delta = f;
      let compare = f;

      if (f.length === 1) {
        delta = (d, x) => f(d) - x;
        compare = ascendingComparator(f);
      }

      function left(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        while (lo < hi) {
          const mid = (lo + hi) >>> 1;
          if (compare(a[mid], x) < 0) lo = mid + 1;
          else hi = mid;
        }
        return lo;
      }

      function right(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        while (lo < hi) {
          const mid = (lo + hi) >>> 1;
          if (compare(a[mid], x) > 0) hi = mid;
          else lo = mid + 1;
        }
        return lo;
      }

      function center(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        const i = left(a, x, lo, hi - 1);
        return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
      }

      return {left, center, right};
    }

    function ascendingComparator(f) {
      return (d, x) => ascending$1(f(d), x);
    }

    function number(x) {
      return x === null ? NaN : +x;
    }

    const ascendingBisect = bisector(ascending$1);
    const bisectRight = ascendingBisect.right;
    const bisectCenter = bisector(number).center;

    function descending(a, b) {
      return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
    }

    // https://github.com/python/cpython/blob/a74eea238f5baba15797e2e8b570d153bc8690a7/Modules/mathmodule.c#L1423
    class Adder {
      constructor() {
        this._partials = new Float64Array(32);
        this._n = 0;
      }
      add(x) {
        const p = this._partials;
        let i = 0;
        for (let j = 0; j < this._n && j < 32; j++) {
          const y = p[j],
            hi = x + y,
            lo = Math.abs(x) < Math.abs(y) ? x - (hi - y) : y - (hi - x);
          if (lo) p[i++] = lo;
          x = hi;
        }
        p[i] = x;
        this._n = i + 1;
        return this;
      }
      valueOf() {
        const p = this._partials;
        let n = this._n, x, y, lo, hi = 0;
        if (n > 0) {
          hi = p[--n];
          while (n > 0) {
            x = hi;
            y = p[--n];
            hi = x + y;
            lo = y - (hi - x);
            if (lo) break;
          }
          if (n > 0 && ((lo < 0 && p[n - 1] < 0) || (lo > 0 && p[n - 1] > 0))) {
            y = lo * 2;
            x = hi + y;
            if (y == x - hi) hi = x;
          }
        }
        return hi;
      }
    }

    var e10 = Math.sqrt(50),
        e5 = Math.sqrt(10),
        e2 = Math.sqrt(2);

    function ticks(start, stop, count) {
      var reverse,
          i = -1,
          n,
          ticks,
          step;

      stop = +stop, start = +start, count = +count;
      if (start === stop && count > 0) return [start];
      if (reverse = stop < start) n = start, start = stop, stop = n;
      if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

      if (step > 0) {
        start = Math.ceil(start / step);
        stop = Math.floor(stop / step);
        ticks = new Array(n = Math.ceil(stop - start + 1));
        while (++i < n) ticks[i] = (start + i) * step;
      } else {
        step = -step;
        start = Math.ceil(start * step);
        stop = Math.floor(stop * step);
        ticks = new Array(n = Math.ceil(stop - start + 1));
        while (++i < n) ticks[i] = (start + i) / step;
      }

      if (reverse) ticks.reverse();

      return ticks;
    }

    function tickIncrement(start, stop, count) {
      var step = (stop - start) / Math.max(0, count),
          power = Math.floor(Math.log(step) / Math.LN10),
          error = step / Math.pow(10, power);
      return power >= 0
          ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
          : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
    }

    function tickStep(start, stop, count) {
      var step0 = Math.abs(stop - start) / Math.max(0, count),
          step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
          error = step0 / step1;
      if (error >= e10) step1 *= 10;
      else if (error >= e5) step1 *= 5;
      else if (error >= e2) step1 *= 2;
      return stop < start ? -step1 : step1;
    }

    function max(values, valueof) {
      let max;
      if (valueof === undefined) {
        for (const value of values) {
          if (value != null
              && (max < value || (max === undefined && value >= value))) {
            max = value;
          }
        }
      } else {
        let index = -1;
        for (let value of values) {
          if ((value = valueof(value, ++index, values)) != null
              && (max < value || (max === undefined && value >= value))) {
            max = value;
          }
        }
      }
      return max;
    }

    function min(values, valueof) {
      let min;
      if (valueof === undefined) {
        for (const value of values) {
          if (value != null
              && (min > value || (min === undefined && value >= value))) {
            min = value;
          }
        }
      } else {
        let index = -1;
        for (let value of values) {
          if ((value = valueof(value, ++index, values)) != null
              && (min > value || (min === undefined && value >= value))) {
            min = value;
          }
        }
      }
      return min;
    }

    function* flatten(arrays) {
      for (const array of arrays) {
        yield* array;
      }
    }

    function merge(arrays) {
      return Array.from(flatten(arrays));
    }

    function range(start, stop, step) {
      start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

      var i = -1,
          n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
          range = new Array(n);

      while (++i < n) {
        range[i] = start + i * step;
      }

      return range;
    }

    function initRange(domain, range) {
      switch (arguments.length) {
        case 0: break;
        case 1: this.range(domain); break;
        default: this.range(range).domain(domain); break;
      }
      return this;
    }

    const implicit = Symbol("implicit");

    function ordinal() {
      var index = new Map(),
          domain = [],
          range = [],
          unknown = implicit;

      function scale(d) {
        var key = d + "", i = index.get(key);
        if (!i) {
          if (unknown !== implicit) return unknown;
          index.set(key, i = domain.push(d));
        }
        return range[(i - 1) % range.length];
      }

      scale.domain = function(_) {
        if (!arguments.length) return domain.slice();
        domain = [], index = new Map();
        for (const value of _) {
          const key = value + "";
          if (index.has(key)) continue;
          index.set(key, domain.push(value));
        }
        return scale;
      };

      scale.range = function(_) {
        return arguments.length ? (range = Array.from(_), scale) : range.slice();
      };

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      scale.copy = function() {
        return ordinal(domain, range).unknown(unknown);
      };

      initRange.apply(scale, arguments);

      return scale;
    }

    function band() {
      var scale = ordinal().unknown(undefined),
          domain = scale.domain,
          ordinalRange = scale.range,
          r0 = 0,
          r1 = 1,
          step,
          bandwidth,
          round = false,
          paddingInner = 0,
          paddingOuter = 0,
          align = 0.5;

      delete scale.unknown;

      function rescale() {
        var n = domain().length,
            reverse = r1 < r0,
            start = reverse ? r1 : r0,
            stop = reverse ? r0 : r1;
        step = (stop - start) / Math.max(1, n - paddingInner + paddingOuter * 2);
        if (round) step = Math.floor(step);
        start += (stop - start - step * (n - paddingInner)) * align;
        bandwidth = step * (1 - paddingInner);
        if (round) start = Math.round(start), bandwidth = Math.round(bandwidth);
        var values = range(n).map(function(i) { return start + step * i; });
        return ordinalRange(reverse ? values.reverse() : values);
      }

      scale.domain = function(_) {
        return arguments.length ? (domain(_), rescale()) : domain();
      };

      scale.range = function(_) {
        return arguments.length ? ([r0, r1] = _, r0 = +r0, r1 = +r1, rescale()) : [r0, r1];
      };

      scale.rangeRound = function(_) {
        return [r0, r1] = _, r0 = +r0, r1 = +r1, round = true, rescale();
      };

      scale.bandwidth = function() {
        return bandwidth;
      };

      scale.step = function() {
        return step;
      };

      scale.round = function(_) {
        return arguments.length ? (round = !!_, rescale()) : round;
      };

      scale.padding = function(_) {
        return arguments.length ? (paddingInner = Math.min(1, paddingOuter = +_), rescale()) : paddingInner;
      };

      scale.paddingInner = function(_) {
        return arguments.length ? (paddingInner = Math.min(1, _), rescale()) : paddingInner;
      };

      scale.paddingOuter = function(_) {
        return arguments.length ? (paddingOuter = +_, rescale()) : paddingOuter;
      };

      scale.align = function(_) {
        return arguments.length ? (align = Math.max(0, Math.min(1, _)), rescale()) : align;
      };

      scale.copy = function() {
        return band(domain(), [r0, r1])
            .round(round)
            .paddingInner(paddingInner)
            .paddingOuter(paddingOuter)
            .align(align);
      };

      return initRange.apply(rescale(), arguments);
    }

    function define(constructor, factory, prototype) {
      constructor.prototype = factory.prototype = prototype;
      prototype.constructor = constructor;
    }

    function extend(parent, definition) {
      var prototype = Object.create(parent.prototype);
      for (var key in definition) prototype[key] = definition[key];
      return prototype;
    }

    function Color() {}

    var darker = 0.7;
    var brighter = 1 / darker;

    var reI = "\\s*([+-]?\\d+)\\s*",
        reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
        reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
        reHex = /^#([0-9a-f]{3,8})$/,
        reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
        reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
        reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
        reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
        reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
        reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

    var named = {
      aliceblue: 0xf0f8ff,
      antiquewhite: 0xfaebd7,
      aqua: 0x00ffff,
      aquamarine: 0x7fffd4,
      azure: 0xf0ffff,
      beige: 0xf5f5dc,
      bisque: 0xffe4c4,
      black: 0x000000,
      blanchedalmond: 0xffebcd,
      blue: 0x0000ff,
      blueviolet: 0x8a2be2,
      brown: 0xa52a2a,
      burlywood: 0xdeb887,
      cadetblue: 0x5f9ea0,
      chartreuse: 0x7fff00,
      chocolate: 0xd2691e,
      coral: 0xff7f50,
      cornflowerblue: 0x6495ed,
      cornsilk: 0xfff8dc,
      crimson: 0xdc143c,
      cyan: 0x00ffff,
      darkblue: 0x00008b,
      darkcyan: 0x008b8b,
      darkgoldenrod: 0xb8860b,
      darkgray: 0xa9a9a9,
      darkgreen: 0x006400,
      darkgrey: 0xa9a9a9,
      darkkhaki: 0xbdb76b,
      darkmagenta: 0x8b008b,
      darkolivegreen: 0x556b2f,
      darkorange: 0xff8c00,
      darkorchid: 0x9932cc,
      darkred: 0x8b0000,
      darksalmon: 0xe9967a,
      darkseagreen: 0x8fbc8f,
      darkslateblue: 0x483d8b,
      darkslategray: 0x2f4f4f,
      darkslategrey: 0x2f4f4f,
      darkturquoise: 0x00ced1,
      darkviolet: 0x9400d3,
      deeppink: 0xff1493,
      deepskyblue: 0x00bfff,
      dimgray: 0x696969,
      dimgrey: 0x696969,
      dodgerblue: 0x1e90ff,
      firebrick: 0xb22222,
      floralwhite: 0xfffaf0,
      forestgreen: 0x228b22,
      fuchsia: 0xff00ff,
      gainsboro: 0xdcdcdc,
      ghostwhite: 0xf8f8ff,
      gold: 0xffd700,
      goldenrod: 0xdaa520,
      gray: 0x808080,
      green: 0x008000,
      greenyellow: 0xadff2f,
      grey: 0x808080,
      honeydew: 0xf0fff0,
      hotpink: 0xff69b4,
      indianred: 0xcd5c5c,
      indigo: 0x4b0082,
      ivory: 0xfffff0,
      khaki: 0xf0e68c,
      lavender: 0xe6e6fa,
      lavenderblush: 0xfff0f5,
      lawngreen: 0x7cfc00,
      lemonchiffon: 0xfffacd,
      lightblue: 0xadd8e6,
      lightcoral: 0xf08080,
      lightcyan: 0xe0ffff,
      lightgoldenrodyellow: 0xfafad2,
      lightgray: 0xd3d3d3,
      lightgreen: 0x90ee90,
      lightgrey: 0xd3d3d3,
      lightpink: 0xffb6c1,
      lightsalmon: 0xffa07a,
      lightseagreen: 0x20b2aa,
      lightskyblue: 0x87cefa,
      lightslategray: 0x778899,
      lightslategrey: 0x778899,
      lightsteelblue: 0xb0c4de,
      lightyellow: 0xffffe0,
      lime: 0x00ff00,
      limegreen: 0x32cd32,
      linen: 0xfaf0e6,
      magenta: 0xff00ff,
      maroon: 0x800000,
      mediumaquamarine: 0x66cdaa,
      mediumblue: 0x0000cd,
      mediumorchid: 0xba55d3,
      mediumpurple: 0x9370db,
      mediumseagreen: 0x3cb371,
      mediumslateblue: 0x7b68ee,
      mediumspringgreen: 0x00fa9a,
      mediumturquoise: 0x48d1cc,
      mediumvioletred: 0xc71585,
      midnightblue: 0x191970,
      mintcream: 0xf5fffa,
      mistyrose: 0xffe4e1,
      moccasin: 0xffe4b5,
      navajowhite: 0xffdead,
      navy: 0x000080,
      oldlace: 0xfdf5e6,
      olive: 0x808000,
      olivedrab: 0x6b8e23,
      orange: 0xffa500,
      orangered: 0xff4500,
      orchid: 0xda70d6,
      palegoldenrod: 0xeee8aa,
      palegreen: 0x98fb98,
      paleturquoise: 0xafeeee,
      palevioletred: 0xdb7093,
      papayawhip: 0xffefd5,
      peachpuff: 0xffdab9,
      peru: 0xcd853f,
      pink: 0xffc0cb,
      plum: 0xdda0dd,
      powderblue: 0xb0e0e6,
      purple: 0x800080,
      rebeccapurple: 0x663399,
      red: 0xff0000,
      rosybrown: 0xbc8f8f,
      royalblue: 0x4169e1,
      saddlebrown: 0x8b4513,
      salmon: 0xfa8072,
      sandybrown: 0xf4a460,
      seagreen: 0x2e8b57,
      seashell: 0xfff5ee,
      sienna: 0xa0522d,
      silver: 0xc0c0c0,
      skyblue: 0x87ceeb,
      slateblue: 0x6a5acd,
      slategray: 0x708090,
      slategrey: 0x708090,
      snow: 0xfffafa,
      springgreen: 0x00ff7f,
      steelblue: 0x4682b4,
      tan: 0xd2b48c,
      teal: 0x008080,
      thistle: 0xd8bfd8,
      tomato: 0xff6347,
      turquoise: 0x40e0d0,
      violet: 0xee82ee,
      wheat: 0xf5deb3,
      white: 0xffffff,
      whitesmoke: 0xf5f5f5,
      yellow: 0xffff00,
      yellowgreen: 0x9acd32
    };

    define(Color, color, {
      copy: function(channels) {
        return Object.assign(new this.constructor, this, channels);
      },
      displayable: function() {
        return this.rgb().displayable();
      },
      hex: color_formatHex, // Deprecated! Use color.formatHex.
      formatHex: color_formatHex,
      formatHsl: color_formatHsl,
      formatRgb: color_formatRgb,
      toString: color_formatRgb
    });

    function color_formatHex() {
      return this.rgb().formatHex();
    }

    function color_formatHsl() {
      return hslConvert(this).formatHsl();
    }

    function color_formatRgb() {
      return this.rgb().formatRgb();
    }

    function color(format) {
      var m, l;
      format = (format + "").trim().toLowerCase();
      return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
          : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
          : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
          : l === 4 ? rgba((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
          : null) // invalid hex
          : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
          : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
          : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
          : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
          : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
          : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
          : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
          : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
          : null;
    }

    function rgbn(n) {
      return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
    }

    function rgba(r, g, b, a) {
      if (a <= 0) r = g = b = NaN;
      return new Rgb(r, g, b, a);
    }

    function rgbConvert(o) {
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Rgb;
      o = o.rgb();
      return new Rgb(o.r, o.g, o.b, o.opacity);
    }

    function rgb(r, g, b, opacity) {
      return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
    }

    function Rgb(r, g, b, opacity) {
      this.r = +r;
      this.g = +g;
      this.b = +b;
      this.opacity = +opacity;
    }

    define(Rgb, rgb, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      rgb: function() {
        return this;
      },
      displayable: function() {
        return (-0.5 <= this.r && this.r < 255.5)
            && (-0.5 <= this.g && this.g < 255.5)
            && (-0.5 <= this.b && this.b < 255.5)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      hex: rgb_formatHex, // Deprecated! Use color.formatHex.
      formatHex: rgb_formatHex,
      formatRgb: rgb_formatRgb,
      toString: rgb_formatRgb
    }));

    function rgb_formatHex() {
      return "#" + hex(this.r) + hex(this.g) + hex(this.b);
    }

    function rgb_formatRgb() {
      var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
      return (a === 1 ? "rgb(" : "rgba(")
          + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.b) || 0))
          + (a === 1 ? ")" : ", " + a + ")");
    }

    function hex(value) {
      value = Math.max(0, Math.min(255, Math.round(value) || 0));
      return (value < 16 ? "0" : "") + value.toString(16);
    }

    function hsla(h, s, l, a) {
      if (a <= 0) h = s = l = NaN;
      else if (l <= 0 || l >= 1) h = s = NaN;
      else if (s <= 0) h = NaN;
      return new Hsl(h, s, l, a);
    }

    function hslConvert(o) {
      if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Hsl;
      if (o instanceof Hsl) return o;
      o = o.rgb();
      var r = o.r / 255,
          g = o.g / 255,
          b = o.b / 255,
          min = Math.min(r, g, b),
          max = Math.max(r, g, b),
          h = NaN,
          s = max - min,
          l = (max + min) / 2;
      if (s) {
        if (r === max) h = (g - b) / s + (g < b) * 6;
        else if (g === max) h = (b - r) / s + 2;
        else h = (r - g) / s + 4;
        s /= l < 0.5 ? max + min : 2 - max - min;
        h *= 60;
      } else {
        s = l > 0 && l < 1 ? 0 : h;
      }
      return new Hsl(h, s, l, o.opacity);
    }

    function hsl(h, s, l, opacity) {
      return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
    }

    function Hsl(h, s, l, opacity) {
      this.h = +h;
      this.s = +s;
      this.l = +l;
      this.opacity = +opacity;
    }

    define(Hsl, hsl, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      rgb: function() {
        var h = this.h % 360 + (this.h < 0) * 360,
            s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
            l = this.l,
            m2 = l + (l < 0.5 ? l : 1 - l) * s,
            m1 = 2 * l - m2;
        return new Rgb(
          hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
          hsl2rgb(h, m1, m2),
          hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
          this.opacity
        );
      },
      displayable: function() {
        return (0 <= this.s && this.s <= 1 || isNaN(this.s))
            && (0 <= this.l && this.l <= 1)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      formatHsl: function() {
        var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
        return (a === 1 ? "hsl(" : "hsla(")
            + (this.h || 0) + ", "
            + (this.s || 0) * 100 + "%, "
            + (this.l || 0) * 100 + "%"
            + (a === 1 ? ")" : ", " + a + ")");
      }
    }));

    /* From FvD 13.37, CSS Color Module Level 3 */
    function hsl2rgb(h, m1, m2) {
      return (h < 60 ? m1 + (m2 - m1) * h / 60
          : h < 180 ? m2
          : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
          : m1) * 255;
    }

    var constant$1 = x => () => x;

    function linear(a, d) {
      return function(t) {
        return a + t * d;
      };
    }

    function exponential(a, b, y) {
      return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
        return Math.pow(a + t * b, y);
      };
    }

    function gamma(y) {
      return (y = +y) === 1 ? nogamma : function(a, b) {
        return b - a ? exponential(a, b, y) : constant$1(isNaN(a) ? b : a);
      };
    }

    function nogamma(a, b) {
      var d = b - a;
      return d ? linear(a, d) : constant$1(isNaN(a) ? b : a);
    }

    var interpolateRgb = (function rgbGamma(y) {
      var color = gamma(y);

      function rgb$1(start, end) {
        var r = color((start = rgb(start)).r, (end = rgb(end)).r),
            g = color(start.g, end.g),
            b = color(start.b, end.b),
            opacity = nogamma(start.opacity, end.opacity);
        return function(t) {
          start.r = r(t);
          start.g = g(t);
          start.b = b(t);
          start.opacity = opacity(t);
          return start + "";
        };
      }

      rgb$1.gamma = rgbGamma;

      return rgb$1;
    })(1);

    function numberArray(a, b) {
      if (!b) b = [];
      var n = a ? Math.min(b.length, a.length) : 0,
          c = b.slice(),
          i;
      return function(t) {
        for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
        return c;
      };
    }

    function isNumberArray(x) {
      return ArrayBuffer.isView(x) && !(x instanceof DataView);
    }

    function genericArray(a, b) {
      var nb = b ? b.length : 0,
          na = a ? Math.min(nb, a.length) : 0,
          x = new Array(na),
          c = new Array(nb),
          i;

      for (i = 0; i < na; ++i) x[i] = interpolate(a[i], b[i]);
      for (; i < nb; ++i) c[i] = b[i];

      return function(t) {
        for (i = 0; i < na; ++i) c[i] = x[i](t);
        return c;
      };
    }

    function date(a, b) {
      var d = new Date;
      return a = +a, b = +b, function(t) {
        return d.setTime(a * (1 - t) + b * t), d;
      };
    }

    function interpolateNumber(a, b) {
      return a = +a, b = +b, function(t) {
        return a * (1 - t) + b * t;
      };
    }

    function object(a, b) {
      var i = {},
          c = {},
          k;

      if (a === null || typeof a !== "object") a = {};
      if (b === null || typeof b !== "object") b = {};

      for (k in b) {
        if (k in a) {
          i[k] = interpolate(a[k], b[k]);
        } else {
          c[k] = b[k];
        }
      }

      return function(t) {
        for (k in i) c[k] = i[k](t);
        return c;
      };
    }

    var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
        reB = new RegExp(reA.source, "g");

    function zero(b) {
      return function() {
        return b;
      };
    }

    function one(b) {
      return function(t) {
        return b(t) + "";
      };
    }

    function interpolateString(a, b) {
      var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
          am, // current match in a
          bm, // current match in b
          bs, // string preceding current number in b, if any
          i = -1, // index in s
          s = [], // string constants and placeholders
          q = []; // number interpolators

      // Coerce inputs to strings.
      a = a + "", b = b + "";

      // Interpolate pairs of numbers in a & b.
      while ((am = reA.exec(a))
          && (bm = reB.exec(b))) {
        if ((bs = bm.index) > bi) { // a string precedes the next number in b
          bs = b.slice(bi, bs);
          if (s[i]) s[i] += bs; // coalesce with previous string
          else s[++i] = bs;
        }
        if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
          if (s[i]) s[i] += bm; // coalesce with previous string
          else s[++i] = bm;
        } else { // interpolate non-matching numbers
          s[++i] = null;
          q.push({i: i, x: interpolateNumber(am, bm)});
        }
        bi = reB.lastIndex;
      }

      // Add remains of b.
      if (bi < b.length) {
        bs = b.slice(bi);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }

      // Special optimization for only a single match.
      // Otherwise, interpolate each of the numbers and rejoin the string.
      return s.length < 2 ? (q[0]
          ? one(q[0].x)
          : zero(b))
          : (b = q.length, function(t) {
              for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
              return s.join("");
            });
    }

    function interpolate(a, b) {
      var t = typeof b, c;
      return b == null || t === "boolean" ? constant$1(b)
          : (t === "number" ? interpolateNumber
          : t === "string" ? ((c = color(b)) ? (b = c, interpolateRgb) : interpolateString)
          : b instanceof color ? interpolateRgb
          : b instanceof Date ? date
          : isNumberArray(b) ? numberArray
          : Array.isArray(b) ? genericArray
          : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
          : interpolateNumber)(a, b);
    }

    function interpolateRound(a, b) {
      return a = +a, b = +b, function(t) {
        return Math.round(a * (1 - t) + b * t);
      };
    }

    var degrees = 180 / Math.PI;

    var identity = {
      translateX: 0,
      translateY: 0,
      rotate: 0,
      skewX: 0,
      scaleX: 1,
      scaleY: 1
    };

    function decompose(a, b, c, d, e, f) {
      var scaleX, scaleY, skewX;
      if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
      if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
      if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
      if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
      return {
        translateX: e,
        translateY: f,
        rotate: Math.atan2(b, a) * degrees,
        skewX: Math.atan(skewX) * degrees,
        scaleX: scaleX,
        scaleY: scaleY
      };
    }

    var svgNode;

    /* eslint-disable no-undef */
    function parseCss(value) {
      const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
      return m.isIdentity ? identity : decompose(m.a, m.b, m.c, m.d, m.e, m.f);
    }

    function parseSvg(value) {
      if (value == null) return identity;
      if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
      svgNode.setAttribute("transform", value);
      if (!(value = svgNode.transform.baseVal.consolidate())) return identity;
      value = value.matrix;
      return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
    }

    function interpolateTransform(parse, pxComma, pxParen, degParen) {

      function pop(s) {
        return s.length ? s.pop() + " " : "";
      }

      function translate(xa, ya, xb, yb, s, q) {
        if (xa !== xb || ya !== yb) {
          var i = s.push("translate(", null, pxComma, null, pxParen);
          q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
        } else if (xb || yb) {
          s.push("translate(" + xb + pxComma + yb + pxParen);
        }
      }

      function rotate(a, b, s, q) {
        if (a !== b) {
          if (a - b > 180) b += 360; else if (b - a > 180) a += 360; // shortest path
          q.push({i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: interpolateNumber(a, b)});
        } else if (b) {
          s.push(pop(s) + "rotate(" + b + degParen);
        }
      }

      function skewX(a, b, s, q) {
        if (a !== b) {
          q.push({i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: interpolateNumber(a, b)});
        } else if (b) {
          s.push(pop(s) + "skewX(" + b + degParen);
        }
      }

      function scale(xa, ya, xb, yb, s, q) {
        if (xa !== xb || ya !== yb) {
          var i = s.push(pop(s) + "scale(", null, ",", null, ")");
          q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
        } else if (xb !== 1 || yb !== 1) {
          s.push(pop(s) + "scale(" + xb + "," + yb + ")");
        }
      }

      return function(a, b) {
        var s = [], // string constants and placeholders
            q = []; // number interpolators
        a = parse(a), b = parse(b);
        translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
        rotate(a.rotate, b.rotate, s, q);
        skewX(a.skewX, b.skewX, s, q);
        scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
        a = b = null; // gc
        return function(t) {
          var i = -1, n = q.length, o;
          while (++i < n) s[(o = q[i]).i] = o.x(t);
          return s.join("");
        };
      };
    }

    var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
    var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

    function constants(x) {
      return function() {
        return x;
      };
    }

    function number$1(x) {
      return +x;
    }

    var unit = [0, 1];

    function identity$1(x) {
      return x;
    }

    function normalize(a, b) {
      return (b -= (a = +a))
          ? function(x) { return (x - a) / b; }
          : constants(isNaN(b) ? NaN : 0.5);
    }

    function clamper(a, b) {
      var t;
      if (a > b) t = a, a = b, b = t;
      return function(x) { return Math.max(a, Math.min(b, x)); };
    }

    // normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
    // interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
    function bimap(domain, range, interpolate) {
      var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
      if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
      else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
      return function(x) { return r0(d0(x)); };
    }

    function polymap(domain, range, interpolate) {
      var j = Math.min(domain.length, range.length) - 1,
          d = new Array(j),
          r = new Array(j),
          i = -1;

      // Reverse descending domains.
      if (domain[j] < domain[0]) {
        domain = domain.slice().reverse();
        range = range.slice().reverse();
      }

      while (++i < j) {
        d[i] = normalize(domain[i], domain[i + 1]);
        r[i] = interpolate(range[i], range[i + 1]);
      }

      return function(x) {
        var i = bisectRight(domain, x, 1, j) - 1;
        return r[i](d[i](x));
      };
    }

    function copy(source, target) {
      return target
          .domain(source.domain())
          .range(source.range())
          .interpolate(source.interpolate())
          .clamp(source.clamp())
          .unknown(source.unknown());
    }

    function transformer() {
      var domain = unit,
          range = unit,
          interpolate$1 = interpolate,
          transform,
          untransform,
          unknown,
          clamp = identity$1,
          piecewise,
          output,
          input;

      function rescale() {
        var n = Math.min(domain.length, range.length);
        if (clamp !== identity$1) clamp = clamper(domain[0], domain[n - 1]);
        piecewise = n > 2 ? polymap : bimap;
        output = input = null;
        return scale;
      }

      function scale(x) {
        return isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate$1)))(transform(clamp(x)));
      }

      scale.invert = function(y) {
        return clamp(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber)))(y)));
      };

      scale.domain = function(_) {
        return arguments.length ? (domain = Array.from(_, number$1), rescale()) : domain.slice();
      };

      scale.range = function(_) {
        return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
      };

      scale.rangeRound = function(_) {
        return range = Array.from(_), interpolate$1 = interpolateRound, rescale();
      };

      scale.clamp = function(_) {
        return arguments.length ? (clamp = _ ? true : identity$1, rescale()) : clamp !== identity$1;
      };

      scale.interpolate = function(_) {
        return arguments.length ? (interpolate$1 = _, rescale()) : interpolate$1;
      };

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      return function(t, u) {
        transform = t, untransform = u;
        return rescale();
      };
    }

    function continuous() {
      return transformer()(identity$1, identity$1);
    }

    function formatDecimal(x) {
      return Math.abs(x = Math.round(x)) >= 1e21
          ? x.toLocaleString("en").replace(/,/g, "")
          : x.toString(10);
    }

    // Computes the decimal coefficient and exponent of the specified number x with
    // significant digits p, where x is positive and p is in [1, 21] or undefined.
    // For example, formatDecimalParts(1.23) returns ["123", 0].
    function formatDecimalParts(x, p) {
      if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
      var i, coefficient = x.slice(0, i);

      // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
      // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
      return [
        coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
        +x.slice(i + 1)
      ];
    }

    function exponent(x) {
      return x = formatDecimalParts(Math.abs(x)), x ? x[1] : NaN;
    }

    function formatGroup(grouping, thousands) {
      return function(value, width) {
        var i = value.length,
            t = [],
            j = 0,
            g = grouping[0],
            length = 0;

        while (i > 0 && g > 0) {
          if (length + g + 1 > width) g = Math.max(1, width - length);
          t.push(value.substring(i -= g, i + g));
          if ((length += g + 1) > width) break;
          g = grouping[j = (j + 1) % grouping.length];
        }

        return t.reverse().join(thousands);
      };
    }

    function formatNumerals(numerals) {
      return function(value) {
        return value.replace(/[0-9]/g, function(i) {
          return numerals[+i];
        });
      };
    }

    // [[fill]align][sign][symbol][0][width][,][.precision][~][type]
    var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

    function formatSpecifier(specifier) {
      if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
      var match;
      return new FormatSpecifier({
        fill: match[1],
        align: match[2],
        sign: match[3],
        symbol: match[4],
        zero: match[5],
        width: match[6],
        comma: match[7],
        precision: match[8] && match[8].slice(1),
        trim: match[9],
        type: match[10]
      });
    }

    formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

    function FormatSpecifier(specifier) {
      this.fill = specifier.fill === undefined ? " " : specifier.fill + "";
      this.align = specifier.align === undefined ? ">" : specifier.align + "";
      this.sign = specifier.sign === undefined ? "-" : specifier.sign + "";
      this.symbol = specifier.symbol === undefined ? "" : specifier.symbol + "";
      this.zero = !!specifier.zero;
      this.width = specifier.width === undefined ? undefined : +specifier.width;
      this.comma = !!specifier.comma;
      this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
      this.trim = !!specifier.trim;
      this.type = specifier.type === undefined ? "" : specifier.type + "";
    }

    FormatSpecifier.prototype.toString = function() {
      return this.fill
          + this.align
          + this.sign
          + this.symbol
          + (this.zero ? "0" : "")
          + (this.width === undefined ? "" : Math.max(1, this.width | 0))
          + (this.comma ? "," : "")
          + (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0))
          + (this.trim ? "~" : "")
          + this.type;
    };

    // Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
    function formatTrim(s) {
      out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
        switch (s[i]) {
          case ".": i0 = i1 = i; break;
          case "0": if (i0 === 0) i0 = i; i1 = i; break;
          default: if (!+s[i]) break out; if (i0 > 0) i0 = 0; break;
        }
      }
      return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
    }

    var prefixExponent;

    function formatPrefixAuto(x, p) {
      var d = formatDecimalParts(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1],
          i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
          n = coefficient.length;
      return i === n ? coefficient
          : i > n ? coefficient + new Array(i - n + 1).join("0")
          : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
          : "0." + new Array(1 - i).join("0") + formatDecimalParts(x, Math.max(0, p + i - 1))[0]; // less than 1y!
    }

    function formatRounded(x, p) {
      var d = formatDecimalParts(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1];
      return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
          : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
          : coefficient + new Array(exponent - coefficient.length + 2).join("0");
    }

    var formatTypes = {
      "%": (x, p) => (x * 100).toFixed(p),
      "b": (x) => Math.round(x).toString(2),
      "c": (x) => x + "",
      "d": formatDecimal,
      "e": (x, p) => x.toExponential(p),
      "f": (x, p) => x.toFixed(p),
      "g": (x, p) => x.toPrecision(p),
      "o": (x) => Math.round(x).toString(8),
      "p": (x, p) => formatRounded(x * 100, p),
      "r": formatRounded,
      "s": formatPrefixAuto,
      "X": (x) => Math.round(x).toString(16).toUpperCase(),
      "x": (x) => Math.round(x).toString(16)
    };

    function identity$2(x) {
      return x;
    }

    var map = Array.prototype.map,
        prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

    function formatLocale(locale) {
      var group = locale.grouping === undefined || locale.thousands === undefined ? identity$2 : formatGroup(map.call(locale.grouping, Number), locale.thousands + ""),
          currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "",
          currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "",
          decimal = locale.decimal === undefined ? "." : locale.decimal + "",
          numerals = locale.numerals === undefined ? identity$2 : formatNumerals(map.call(locale.numerals, String)),
          percent = locale.percent === undefined ? "%" : locale.percent + "",
          minus = locale.minus === undefined ? "−" : locale.minus + "",
          nan = locale.nan === undefined ? "NaN" : locale.nan + "";

      function newFormat(specifier) {
        specifier = formatSpecifier(specifier);

        var fill = specifier.fill,
            align = specifier.align,
            sign = specifier.sign,
            symbol = specifier.symbol,
            zero = specifier.zero,
            width = specifier.width,
            comma = specifier.comma,
            precision = specifier.precision,
            trim = specifier.trim,
            type = specifier.type;

        // The "n" type is an alias for ",g".
        if (type === "n") comma = true, type = "g";

        // The "" type, and any invalid type, is an alias for ".12~g".
        else if (!formatTypes[type]) precision === undefined && (precision = 12), trim = true, type = "g";

        // If zero fill is specified, padding goes after sign and before digits.
        if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

        // Compute the prefix and suffix.
        // For SI-prefix, the suffix is lazily computed.
        var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
            suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";

        // What format function should we use?
        // Is this an integer type?
        // Can this type generate exponential notation?
        var formatType = formatTypes[type],
            maybeSuffix = /[defgprs%]/.test(type);

        // Set the default precision if not specified,
        // or clamp the specified precision to the supported range.
        // For significant precision, it must be in [1, 21].
        // For fixed precision, it must be in [0, 20].
        precision = precision === undefined ? 6
            : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
            : Math.max(0, Math.min(20, precision));

        function format(value) {
          var valuePrefix = prefix,
              valueSuffix = suffix,
              i, n, c;

          if (type === "c") {
            valueSuffix = formatType(value) + valueSuffix;
            value = "";
          } else {
            value = +value;

            // Determine the sign. -0 is not less than 0, but 1 / -0 is!
            var valueNegative = value < 0 || 1 / value < 0;

            // Perform the initial formatting.
            value = isNaN(value) ? nan : formatType(Math.abs(value), precision);

            // Trim insignificant zeros.
            if (trim) value = formatTrim(value);

            // If a negative value rounds to zero after formatting, and no explicit positive sign is requested, hide the sign.
            if (valueNegative && +value === 0 && sign !== "+") valueNegative = false;

            // Compute the prefix and suffix.
            valuePrefix = (valueNegative ? (sign === "(" ? sign : minus) : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
            valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

            // Break the formatted value into the integer “value” part that can be
            // grouped, and fractional or exponential “suffix” part that is not.
            if (maybeSuffix) {
              i = -1, n = value.length;
              while (++i < n) {
                if (c = value.charCodeAt(i), 48 > c || c > 57) {
                  valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                  value = value.slice(0, i);
                  break;
                }
              }
            }
          }

          // If the fill character is not "0", grouping is applied before padding.
          if (comma && !zero) value = group(value, Infinity);

          // Compute the padding.
          var length = valuePrefix.length + value.length + valueSuffix.length,
              padding = length < width ? new Array(width - length + 1).join(fill) : "";

          // If the fill character is "0", grouping is applied after padding.
          if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

          // Reconstruct the final output based on the desired alignment.
          switch (align) {
            case "<": value = valuePrefix + value + valueSuffix + padding; break;
            case "=": value = valuePrefix + padding + value + valueSuffix; break;
            case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
            default: value = padding + valuePrefix + value + valueSuffix; break;
          }

          return numerals(value);
        }

        format.toString = function() {
          return specifier + "";
        };

        return format;
      }

      function formatPrefix(specifier, value) {
        var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
            e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
            k = Math.pow(10, -e),
            prefix = prefixes[8 + e / 3];
        return function(value) {
          return f(k * value) + prefix;
        };
      }

      return {
        format: newFormat,
        formatPrefix: formatPrefix
      };
    }

    var locale;
    var format;
    var formatPrefix;

    defaultLocale({
      thousands: ",",
      grouping: [3],
      currency: ["$", ""]
    });

    function defaultLocale(definition) {
      locale = formatLocale(definition);
      format = locale.format;
      formatPrefix = locale.formatPrefix;
      return locale;
    }

    function precisionFixed(step) {
      return Math.max(0, -exponent(Math.abs(step)));
    }

    function precisionPrefix(step, value) {
      return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
    }

    function precisionRound(step, max) {
      step = Math.abs(step), max = Math.abs(max) - step;
      return Math.max(0, exponent(max) - exponent(step)) + 1;
    }

    function tickFormat(start, stop, count, specifier) {
      var step = tickStep(start, stop, count),
          precision;
      specifier = formatSpecifier(specifier == null ? ",f" : specifier);
      switch (specifier.type) {
        case "s": {
          var value = Math.max(Math.abs(start), Math.abs(stop));
          if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
          return formatPrefix(specifier, value);
        }
        case "":
        case "e":
        case "g":
        case "p":
        case "r": {
          if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
          break;
        }
        case "f":
        case "%": {
          if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
          break;
        }
      }
      return format(specifier);
    }

    function linearish(scale) {
      var domain = scale.domain;

      scale.ticks = function(count) {
        var d = domain();
        return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
      };

      scale.tickFormat = function(count, specifier) {
        var d = domain();
        return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
      };

      scale.nice = function(count) {
        if (count == null) count = 10;

        var d = domain();
        var i0 = 0;
        var i1 = d.length - 1;
        var start = d[i0];
        var stop = d[i1];
        var prestep;
        var step;
        var maxIter = 10;

        if (stop < start) {
          step = start, start = stop, stop = step;
          step = i0, i0 = i1, i1 = step;
        }
        
        while (maxIter-- > 0) {
          step = tickIncrement(start, stop, count);
          if (step === prestep) {
            d[i0] = start;
            d[i1] = stop;
            return domain(d);
          } else if (step > 0) {
            start = Math.floor(start / step) * step;
            stop = Math.ceil(stop / step) * step;
          } else if (step < 0) {
            start = Math.ceil(start * step) / step;
            stop = Math.floor(stop * step) / step;
          } else {
            break;
          }
          prestep = step;
        }

        return scale;
      };

      return scale;
    }

    function linear$1() {
      var scale = continuous();

      scale.copy = function() {
        return copy(scale, linear$1());
      };

      initRange.apply(scale, arguments);

      return linearish(scale);
    }

    var slice = Array.prototype.slice;

    function identity$3(x) {
      return x;
    }

    var top = 1,
        right = 2,
        bottom = 3,
        left = 4,
        epsilon = 1e-6;

    function translateX(x) {
      return "translate(" + (x + 0.5) + ",0)";
    }

    function translateY(y) {
      return "translate(0," + (y + 0.5) + ")";
    }

    function number$2(scale) {
      return d => +scale(d);
    }

    function center(scale) {
      var offset = Math.max(0, scale.bandwidth() - 1) / 2; // Adjust for 0.5px offset.
      if (scale.round()) offset = Math.round(offset);
      return function(d) {
        return +scale(d) + offset;
      };
    }

    function entering() {
      return !this.__axis;
    }

    function axis(orient, scale) {
      var tickArguments = [],
          tickValues = null,
          tickFormat = null,
          tickSizeInner = 6,
          tickSizeOuter = 6,
          tickPadding = 3,
          k = orient === top || orient === left ? -1 : 1,
          x = orient === left || orient === right ? "x" : "y",
          transform = orient === top || orient === bottom ? translateX : translateY;

      function axis(context) {
        var values = tickValues == null ? (scale.ticks ? scale.ticks.apply(scale, tickArguments) : scale.domain()) : tickValues,
            format = tickFormat == null ? (scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments) : identity$3) : tickFormat,
            spacing = Math.max(tickSizeInner, 0) + tickPadding,
            range = scale.range(),
            range0 = +range[0] + 0.5,
            range1 = +range[range.length - 1] + 0.5,
            position = (scale.bandwidth ? center : number$2)(scale.copy()),
            selection = context.selection ? context.selection() : context,
            path = selection.selectAll(".domain").data([null]),
            tick = selection.selectAll(".tick").data(values, scale).order(),
            tickExit = tick.exit(),
            tickEnter = tick.enter().append("g").attr("class", "tick"),
            line = tick.select("line"),
            text = tick.select("text");

        path = path.merge(path.enter().insert("path", ".tick")
            .attr("class", "domain")
            .attr("stroke", "currentColor"));

        tick = tick.merge(tickEnter);

        line = line.merge(tickEnter.append("line")
            .attr("stroke", "currentColor")
            .attr(x + "2", k * tickSizeInner));

        text = text.merge(tickEnter.append("text")
            .attr("fill", "currentColor")
            .attr(x, k * spacing)
            .attr("dy", orient === top ? "0em" : orient === bottom ? "0.71em" : "0.32em"));

        if (context !== selection) {
          path = path.transition(context);
          tick = tick.transition(context);
          line = line.transition(context);
          text = text.transition(context);

          tickExit = tickExit.transition(context)
              .attr("opacity", epsilon)
              .attr("transform", function(d) { return isFinite(d = position(d)) ? transform(d) : this.getAttribute("transform"); });

          tickEnter
              .attr("opacity", epsilon)
              .attr("transform", function(d) { var p = this.parentNode.__axis; return transform(p && isFinite(p = p(d)) ? p : position(d)); });
        }

        tickExit.remove();

        path
            .attr("d", orient === left || orient == right
                ? (tickSizeOuter ? "M" + k * tickSizeOuter + "," + range0 + "H0.5V" + range1 + "H" + k * tickSizeOuter : "M0.5," + range0 + "V" + range1)
                : (tickSizeOuter ? "M" + range0 + "," + k * tickSizeOuter + "V0.5H" + range1 + "V" + k * tickSizeOuter : "M" + range0 + ",0.5H" + range1));

        tick
            .attr("opacity", 1)
            .attr("transform", function(d) { return transform(position(d)); });

        line
            .attr(x + "2", k * tickSizeInner);

        text
            .attr(x, k * spacing)
            .text(format);

        selection.filter(entering)
            .attr("fill", "none")
            .attr("font-size", 10)
            .attr("font-family", "sans-serif")
            .attr("text-anchor", orient === right ? "start" : orient === left ? "end" : "middle");

        selection
            .each(function() { this.__axis = position; });
      }

      axis.scale = function(_) {
        return arguments.length ? (scale = _, axis) : scale;
      };

      axis.ticks = function() {
        return tickArguments = slice.call(arguments), axis;
      };

      axis.tickArguments = function(_) {
        return arguments.length ? (tickArguments = _ == null ? [] : slice.call(_), axis) : tickArguments.slice();
      };

      axis.tickValues = function(_) {
        return arguments.length ? (tickValues = _ == null ? null : slice.call(_), axis) : tickValues && tickValues.slice();
      };

      axis.tickFormat = function(_) {
        return arguments.length ? (tickFormat = _, axis) : tickFormat;
      };

      axis.tickSize = function(_) {
        return arguments.length ? (tickSizeInner = tickSizeOuter = +_, axis) : tickSizeInner;
      };

      axis.tickSizeInner = function(_) {
        return arguments.length ? (tickSizeInner = +_, axis) : tickSizeInner;
      };

      axis.tickSizeOuter = function(_) {
        return arguments.length ? (tickSizeOuter = +_, axis) : tickSizeOuter;
      };

      axis.tickPadding = function(_) {
        return arguments.length ? (tickPadding = +_, axis) : tickPadding;
      };

      return axis;
    }

    function axisBottom(scale) {
      return axis(bottom, scale);
    }

    function axisLeft(scale) {
      return axis(left, scale);
    }

    var noop$1 = {value: () => {}};

    function dispatch() {
      for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
        if (!(t = arguments[i] + "") || (t in _) || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
        _[t] = [];
      }
      return new Dispatch(_);
    }

    function Dispatch(_) {
      this._ = _;
    }

    function parseTypenames$1(typenames, types) {
      return typenames.trim().split(/^|\s+/).map(function(t) {
        var name = "", i = t.indexOf(".");
        if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
        if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
        return {type: t, name: name};
      });
    }

    Dispatch.prototype = dispatch.prototype = {
      constructor: Dispatch,
      on: function(typename, callback) {
        var _ = this._,
            T = parseTypenames$1(typename + "", _),
            t,
            i = -1,
            n = T.length;

        // If no callback was specified, return the callback of the given type and name.
        if (arguments.length < 2) {
          while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
          return;
        }

        // If a type was specified, set the callback for the given type and name.
        // Otherwise, if a null callback was specified, remove callbacks of the given name.
        if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
        while (++i < n) {
          if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);
          else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
        }

        return this;
      },
      copy: function() {
        var copy = {}, _ = this._;
        for (var t in _) copy[t] = _[t].slice();
        return new Dispatch(copy);
      },
      call: function(type, that) {
        if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
        if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
        for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
      },
      apply: function(type, that, args) {
        if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
        for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
      }
    };

    function get(type, name) {
      for (var i = 0, n = type.length, c; i < n; ++i) {
        if ((c = type[i]).name === name) {
          return c.value;
        }
      }
    }

    function set(type, name, callback) {
      for (var i = 0, n = type.length; i < n; ++i) {
        if (type[i].name === name) {
          type[i] = noop$1, type = type.slice(0, i).concat(type.slice(i + 1));
          break;
        }
      }
      if (callback != null) type.push({name: name, value: callback});
      return type;
    }

    var frame = 0, // is an animation frame pending?
        timeout = 0, // is a timeout pending?
        interval = 0, // are any timers active?
        pokeDelay = 1000, // how frequently we check for clock skew
        taskHead,
        taskTail,
        clockLast = 0,
        clockNow = 0,
        clockSkew = 0,
        clock = typeof performance === "object" && performance.now ? performance : Date,
        setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) { setTimeout(f, 17); };

    function now() {
      return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
    }

    function clearNow() {
      clockNow = 0;
    }

    function Timer() {
      this._call =
      this._time =
      this._next = null;
    }

    Timer.prototype = timer.prototype = {
      constructor: Timer,
      restart: function(callback, delay, time) {
        if (typeof callback !== "function") throw new TypeError("callback is not a function");
        time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
        if (!this._next && taskTail !== this) {
          if (taskTail) taskTail._next = this;
          else taskHead = this;
          taskTail = this;
        }
        this._call = callback;
        this._time = time;
        sleep();
      },
      stop: function() {
        if (this._call) {
          this._call = null;
          this._time = Infinity;
          sleep();
        }
      }
    };

    function timer(callback, delay, time) {
      var t = new Timer;
      t.restart(callback, delay, time);
      return t;
    }

    function timerFlush() {
      now(); // Get the current time, if not already set.
      ++frame; // Pretend we’ve set an alarm, if we haven’t already.
      var t = taskHead, e;
      while (t) {
        if ((e = clockNow - t._time) >= 0) t._call.call(null, e);
        t = t._next;
      }
      --frame;
    }

    function wake() {
      clockNow = (clockLast = clock.now()) + clockSkew;
      frame = timeout = 0;
      try {
        timerFlush();
      } finally {
        frame = 0;
        nap();
        clockNow = 0;
      }
    }

    function poke() {
      var now = clock.now(), delay = now - clockLast;
      if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
    }

    function nap() {
      var t0, t1 = taskHead, t2, time = Infinity;
      while (t1) {
        if (t1._call) {
          if (time > t1._time) time = t1._time;
          t0 = t1, t1 = t1._next;
        } else {
          t2 = t1._next, t1._next = null;
          t1 = t0 ? t0._next = t2 : taskHead = t2;
        }
      }
      taskTail = t0;
      sleep(time);
    }

    function sleep(time) {
      if (frame) return; // Soonest alarm already set, or will be.
      if (timeout) timeout = clearTimeout(timeout);
      var delay = time - clockNow; // Strictly less than if we recomputed clockNow.
      if (delay > 24) {
        if (time < Infinity) timeout = setTimeout(wake, time - clock.now() - clockSkew);
        if (interval) interval = clearInterval(interval);
      } else {
        if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
        frame = 1, setFrame(wake);
      }
    }

    function timeout$1(callback, delay, time) {
      var t = new Timer;
      delay = delay == null ? 0 : +delay;
      t.restart(elapsed => {
        t.stop();
        callback(elapsed + delay);
      }, delay, time);
      return t;
    }

    var emptyOn = dispatch("start", "end", "cancel", "interrupt");
    var emptyTween = [];

    var CREATED = 0;
    var SCHEDULED = 1;
    var STARTING = 2;
    var STARTED = 3;
    var RUNNING = 4;
    var ENDING = 5;
    var ENDED = 6;

    function schedule(node, name, id, index, group, timing) {
      var schedules = node.__transition;
      if (!schedules) node.__transition = {};
      else if (id in schedules) return;
      create(node, id, {
        name: name,
        index: index, // For context during callback.
        group: group, // For context during callback.
        on: emptyOn,
        tween: emptyTween,
        time: timing.time,
        delay: timing.delay,
        duration: timing.duration,
        ease: timing.ease,
        timer: null,
        state: CREATED
      });
    }

    function init$1(node, id) {
      var schedule = get$1(node, id);
      if (schedule.state > CREATED) throw new Error("too late; already scheduled");
      return schedule;
    }

    function set$1(node, id) {
      var schedule = get$1(node, id);
      if (schedule.state > STARTED) throw new Error("too late; already running");
      return schedule;
    }

    function get$1(node, id) {
      var schedule = node.__transition;
      if (!schedule || !(schedule = schedule[id])) throw new Error("transition not found");
      return schedule;
    }

    function create(node, id, self) {
      var schedules = node.__transition,
          tween;

      // Initialize the self timer when the transition is created.
      // Note the actual delay is not known until the first callback!
      schedules[id] = self;
      self.timer = timer(schedule, 0, self.time);

      function schedule(elapsed) {
        self.state = SCHEDULED;
        self.timer.restart(start, self.delay, self.time);

        // If the elapsed delay is less than our first sleep, start immediately.
        if (self.delay <= elapsed) start(elapsed - self.delay);
      }

      function start(elapsed) {
        var i, j, n, o;

        // If the state is not SCHEDULED, then we previously errored on start.
        if (self.state !== SCHEDULED) return stop();

        for (i in schedules) {
          o = schedules[i];
          if (o.name !== self.name) continue;

          // While this element already has a starting transition during this frame,
          // defer starting an interrupting transition until that transition has a
          // chance to tick (and possibly end); see d3/d3-transition#54!
          if (o.state === STARTED) return timeout$1(start);

          // Interrupt the active transition, if any.
          if (o.state === RUNNING) {
            o.state = ENDED;
            o.timer.stop();
            o.on.call("interrupt", node, node.__data__, o.index, o.group);
            delete schedules[i];
          }

          // Cancel any pre-empted transitions.
          else if (+i < id) {
            o.state = ENDED;
            o.timer.stop();
            o.on.call("cancel", node, node.__data__, o.index, o.group);
            delete schedules[i];
          }
        }

        // Defer the first tick to end of the current frame; see d3/d3#1576.
        // Note the transition may be canceled after start and before the first tick!
        // Note this must be scheduled before the start event; see d3/d3-transition#16!
        // Assuming this is successful, subsequent callbacks go straight to tick.
        timeout$1(function() {
          if (self.state === STARTED) {
            self.state = RUNNING;
            self.timer.restart(tick, self.delay, self.time);
            tick(elapsed);
          }
        });

        // Dispatch the start event.
        // Note this must be done before the tween are initialized.
        self.state = STARTING;
        self.on.call("start", node, node.__data__, self.index, self.group);
        if (self.state !== STARTING) return; // interrupted
        self.state = STARTED;

        // Initialize the tween, deleting null tween.
        tween = new Array(n = self.tween.length);
        for (i = 0, j = -1; i < n; ++i) {
          if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
            tween[++j] = o;
          }
        }
        tween.length = j + 1;
      }

      function tick(elapsed) {
        var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1),
            i = -1,
            n = tween.length;

        while (++i < n) {
          tween[i].call(node, t);
        }

        // Dispatch the end event.
        if (self.state === ENDING) {
          self.on.call("end", node, node.__data__, self.index, self.group);
          stop();
        }
      }

      function stop() {
        self.state = ENDED;
        self.timer.stop();
        delete schedules[id];
        for (var i in schedules) return; // eslint-disable-line no-unused-vars
        delete node.__transition;
      }
    }

    function interrupt(node, name) {
      var schedules = node.__transition,
          schedule,
          active,
          empty = true,
          i;

      if (!schedules) return;

      name = name == null ? null : name + "";

      for (i in schedules) {
        if ((schedule = schedules[i]).name !== name) { empty = false; continue; }
        active = schedule.state > STARTING && schedule.state < ENDING;
        schedule.state = ENDED;
        schedule.timer.stop();
        schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
        delete schedules[i];
      }

      if (empty) delete node.__transition;
    }

    function selection_interrupt(name) {
      return this.each(function() {
        interrupt(this, name);
      });
    }

    function tweenRemove(id, name) {
      var tween0, tween1;
      return function() {
        var schedule = set$1(this, id),
            tween = schedule.tween;

        // If this node shared tween with the previous node,
        // just assign the updated shared tween and we’re done!
        // Otherwise, copy-on-write.
        if (tween !== tween0) {
          tween1 = tween0 = tween;
          for (var i = 0, n = tween1.length; i < n; ++i) {
            if (tween1[i].name === name) {
              tween1 = tween1.slice();
              tween1.splice(i, 1);
              break;
            }
          }
        }

        schedule.tween = tween1;
      };
    }

    function tweenFunction(id, name, value) {
      var tween0, tween1;
      if (typeof value !== "function") throw new Error;
      return function() {
        var schedule = set$1(this, id),
            tween = schedule.tween;

        // If this node shared tween with the previous node,
        // just assign the updated shared tween and we’re done!
        // Otherwise, copy-on-write.
        if (tween !== tween0) {
          tween1 = (tween0 = tween).slice();
          for (var t = {name: name, value: value}, i = 0, n = tween1.length; i < n; ++i) {
            if (tween1[i].name === name) {
              tween1[i] = t;
              break;
            }
          }
          if (i === n) tween1.push(t);
        }

        schedule.tween = tween1;
      };
    }

    function transition_tween(name, value) {
      var id = this._id;

      name += "";

      if (arguments.length < 2) {
        var tween = get$1(this.node(), id).tween;
        for (var i = 0, n = tween.length, t; i < n; ++i) {
          if ((t = tween[i]).name === name) {
            return t.value;
          }
        }
        return null;
      }

      return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value));
    }

    function tweenValue(transition, name, value) {
      var id = transition._id;

      transition.each(function() {
        var schedule = set$1(this, id);
        (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
      });

      return function(node) {
        return get$1(node, id).value[name];
      };
    }

    function interpolate$1(a, b) {
      var c;
      return (typeof b === "number" ? interpolateNumber
          : b instanceof color ? interpolateRgb
          : (c = color(b)) ? (b = c, interpolateRgb)
          : interpolateString)(a, b);
    }

    function attrRemove$1(name) {
      return function() {
        this.removeAttribute(name);
      };
    }

    function attrRemoveNS$1(fullname) {
      return function() {
        this.removeAttributeNS(fullname.space, fullname.local);
      };
    }

    function attrConstant$1(name, interpolate, value1) {
      var string00,
          string1 = value1 + "",
          interpolate0;
      return function() {
        var string0 = this.getAttribute(name);
        return string0 === string1 ? null
            : string0 === string00 ? interpolate0
            : interpolate0 = interpolate(string00 = string0, value1);
      };
    }

    function attrConstantNS$1(fullname, interpolate, value1) {
      var string00,
          string1 = value1 + "",
          interpolate0;
      return function() {
        var string0 = this.getAttributeNS(fullname.space, fullname.local);
        return string0 === string1 ? null
            : string0 === string00 ? interpolate0
            : interpolate0 = interpolate(string00 = string0, value1);
      };
    }

    function attrFunction$1(name, interpolate, value) {
      var string00,
          string10,
          interpolate0;
      return function() {
        var string0, value1 = value(this), string1;
        if (value1 == null) return void this.removeAttribute(name);
        string0 = this.getAttribute(name);
        string1 = value1 + "";
        return string0 === string1 ? null
            : string0 === string00 && string1 === string10 ? interpolate0
            : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
      };
    }

    function attrFunctionNS$1(fullname, interpolate, value) {
      var string00,
          string10,
          interpolate0;
      return function() {
        var string0, value1 = value(this), string1;
        if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
        string0 = this.getAttributeNS(fullname.space, fullname.local);
        string1 = value1 + "";
        return string0 === string1 ? null
            : string0 === string00 && string1 === string10 ? interpolate0
            : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
      };
    }

    function transition_attr(name, value) {
      var fullname = namespace(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate$1;
      return this.attrTween(name, typeof value === "function"
          ? (fullname.local ? attrFunctionNS$1 : attrFunction$1)(fullname, i, tweenValue(this, "attr." + name, value))
          : value == null ? (fullname.local ? attrRemoveNS$1 : attrRemove$1)(fullname)
          : (fullname.local ? attrConstantNS$1 : attrConstant$1)(fullname, i, value));
    }

    function attrInterpolate(name, i) {
      return function(t) {
        this.setAttribute(name, i.call(this, t));
      };
    }

    function attrInterpolateNS(fullname, i) {
      return function(t) {
        this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
      };
    }

    function attrTweenNS(fullname, value) {
      var t0, i0;
      function tween() {
        var i = value.apply(this, arguments);
        if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
        return t0;
      }
      tween._value = value;
      return tween;
    }

    function attrTween(name, value) {
      var t0, i0;
      function tween() {
        var i = value.apply(this, arguments);
        if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
        return t0;
      }
      tween._value = value;
      return tween;
    }

    function transition_attrTween(name, value) {
      var key = "attr." + name;
      if (arguments.length < 2) return (key = this.tween(key)) && key._value;
      if (value == null) return this.tween(key, null);
      if (typeof value !== "function") throw new Error;
      var fullname = namespace(name);
      return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
    }

    function delayFunction(id, value) {
      return function() {
        init$1(this, id).delay = +value.apply(this, arguments);
      };
    }

    function delayConstant(id, value) {
      return value = +value, function() {
        init$1(this, id).delay = value;
      };
    }

    function transition_delay(value) {
      var id = this._id;

      return arguments.length
          ? this.each((typeof value === "function"
              ? delayFunction
              : delayConstant)(id, value))
          : get$1(this.node(), id).delay;
    }

    function durationFunction(id, value) {
      return function() {
        set$1(this, id).duration = +value.apply(this, arguments);
      };
    }

    function durationConstant(id, value) {
      return value = +value, function() {
        set$1(this, id).duration = value;
      };
    }

    function transition_duration(value) {
      var id = this._id;

      return arguments.length
          ? this.each((typeof value === "function"
              ? durationFunction
              : durationConstant)(id, value))
          : get$1(this.node(), id).duration;
    }

    function easeConstant(id, value) {
      if (typeof value !== "function") throw new Error;
      return function() {
        set$1(this, id).ease = value;
      };
    }

    function transition_ease(value) {
      var id = this._id;

      return arguments.length
          ? this.each(easeConstant(id, value))
          : get$1(this.node(), id).ease;
    }

    function easeVarying(id, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (typeof v !== "function") throw new Error;
        set$1(this, id).ease = v;
      };
    }

    function transition_easeVarying(value) {
      if (typeof value !== "function") throw new Error;
      return this.each(easeVarying(this._id, value));
    }

    function transition_filter(match) {
      if (typeof match !== "function") match = matcher(match);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
          if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
            subgroup.push(node);
          }
        }
      }

      return new Transition(subgroups, this._parents, this._name, this._id);
    }

    function transition_merge(transition) {
      if (transition._id !== this._id) throw new Error;

      for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
        for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
          if (node = group0[i] || group1[i]) {
            merge[i] = node;
          }
        }
      }

      for (; j < m0; ++j) {
        merges[j] = groups0[j];
      }

      return new Transition(merges, this._parents, this._name, this._id);
    }

    function start(name) {
      return (name + "").trim().split(/^|\s+/).every(function(t) {
        var i = t.indexOf(".");
        if (i >= 0) t = t.slice(0, i);
        return !t || t === "start";
      });
    }

    function onFunction(id, name, listener) {
      var on0, on1, sit = start(name) ? init$1 : set$1;
      return function() {
        var schedule = sit(this, id),
            on = schedule.on;

        // If this node shared a dispatch with the previous node,
        // just assign the updated shared dispatch and we’re done!
        // Otherwise, copy-on-write.
        if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);

        schedule.on = on1;
      };
    }

    function transition_on(name, listener) {
      var id = this._id;

      return arguments.length < 2
          ? get$1(this.node(), id).on.on(name)
          : this.each(onFunction(id, name, listener));
    }

    function removeFunction(id) {
      return function() {
        var parent = this.parentNode;
        for (var i in this.__transition) if (+i !== id) return;
        if (parent) parent.removeChild(this);
      };
    }

    function transition_remove() {
      return this.on("end.remove", removeFunction(this._id));
    }

    function transition_select(select) {
      var name = this._name,
          id = this._id;

      if (typeof select !== "function") select = selector(select);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
          if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
            if ("__data__" in node) subnode.__data__ = node.__data__;
            subgroup[i] = subnode;
            schedule(subgroup[i], name, id, i, subgroup, get$1(node, id));
          }
        }
      }

      return new Transition(subgroups, this._parents, name, id);
    }

    function transition_selectAll(select) {
      var name = this._name,
          id = this._id;

      if (typeof select !== "function") select = selectorAll(select);

      for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            for (var children = select.call(node, node.__data__, i, group), child, inherit = get$1(node, id), k = 0, l = children.length; k < l; ++k) {
              if (child = children[k]) {
                schedule(child, name, id, k, children, inherit);
              }
            }
            subgroups.push(children);
            parents.push(node);
          }
        }
      }

      return new Transition(subgroups, parents, name, id);
    }

    var Selection$1 = selection.prototype.constructor;

    function transition_selection() {
      return new Selection$1(this._groups, this._parents);
    }

    function styleNull(name, interpolate) {
      var string00,
          string10,
          interpolate0;
      return function() {
        var string0 = styleValue(this, name),
            string1 = (this.style.removeProperty(name), styleValue(this, name));
        return string0 === string1 ? null
            : string0 === string00 && string1 === string10 ? interpolate0
            : interpolate0 = interpolate(string00 = string0, string10 = string1);
      };
    }

    function styleRemove$1(name) {
      return function() {
        this.style.removeProperty(name);
      };
    }

    function styleConstant$1(name, interpolate, value1) {
      var string00,
          string1 = value1 + "",
          interpolate0;
      return function() {
        var string0 = styleValue(this, name);
        return string0 === string1 ? null
            : string0 === string00 ? interpolate0
            : interpolate0 = interpolate(string00 = string0, value1);
      };
    }

    function styleFunction$1(name, interpolate, value) {
      var string00,
          string10,
          interpolate0;
      return function() {
        var string0 = styleValue(this, name),
            value1 = value(this),
            string1 = value1 + "";
        if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
        return string0 === string1 ? null
            : string0 === string00 && string1 === string10 ? interpolate0
            : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
      };
    }

    function styleMaybeRemove(id, name) {
      var on0, on1, listener0, key = "style." + name, event = "end." + key, remove;
      return function() {
        var schedule = set$1(this, id),
            on = schedule.on,
            listener = schedule.value[key] == null ? remove || (remove = styleRemove$1(name)) : undefined;

        // If this node shared a dispatch with the previous node,
        // just assign the updated shared dispatch and we’re done!
        // Otherwise, copy-on-write.
        if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);

        schedule.on = on1;
      };
    }

    function transition_style(name, value, priority) {
      var i = (name += "") === "transform" ? interpolateTransformCss : interpolate$1;
      return value == null ? this
          .styleTween(name, styleNull(name, i))
          .on("end.style." + name, styleRemove$1(name))
        : typeof value === "function" ? this
          .styleTween(name, styleFunction$1(name, i, tweenValue(this, "style." + name, value)))
          .each(styleMaybeRemove(this._id, name))
        : this
          .styleTween(name, styleConstant$1(name, i, value), priority)
          .on("end.style." + name, null);
    }

    function styleInterpolate(name, i, priority) {
      return function(t) {
        this.style.setProperty(name, i.call(this, t), priority);
      };
    }

    function styleTween(name, value, priority) {
      var t, i0;
      function tween() {
        var i = value.apply(this, arguments);
        if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
        return t;
      }
      tween._value = value;
      return tween;
    }

    function transition_styleTween(name, value, priority) {
      var key = "style." + (name += "");
      if (arguments.length < 2) return (key = this.tween(key)) && key._value;
      if (value == null) return this.tween(key, null);
      if (typeof value !== "function") throw new Error;
      return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
    }

    function textConstant$1(value) {
      return function() {
        this.textContent = value;
      };
    }

    function textFunction$1(value) {
      return function() {
        var value1 = value(this);
        this.textContent = value1 == null ? "" : value1;
      };
    }

    function transition_text(value) {
      return this.tween("text", typeof value === "function"
          ? textFunction$1(tweenValue(this, "text", value))
          : textConstant$1(value == null ? "" : value + ""));
    }

    function textInterpolate(i) {
      return function(t) {
        this.textContent = i.call(this, t);
      };
    }

    function textTween(value) {
      var t0, i0;
      function tween() {
        var i = value.apply(this, arguments);
        if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
        return t0;
      }
      tween._value = value;
      return tween;
    }

    function transition_textTween(value) {
      var key = "text";
      if (arguments.length < 1) return (key = this.tween(key)) && key._value;
      if (value == null) return this.tween(key, null);
      if (typeof value !== "function") throw new Error;
      return this.tween(key, textTween(value));
    }

    function transition_transition() {
      var name = this._name,
          id0 = this._id,
          id1 = newId();

      for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            var inherit = get$1(node, id0);
            schedule(node, name, id1, i, group, {
              time: inherit.time + inherit.delay + inherit.duration,
              delay: 0,
              duration: inherit.duration,
              ease: inherit.ease
            });
          }
        }
      }

      return new Transition(groups, this._parents, name, id1);
    }

    function transition_end() {
      var on0, on1, that = this, id = that._id, size = that.size();
      return new Promise(function(resolve, reject) {
        var cancel = {value: reject},
            end = {value: function() { if (--size === 0) resolve(); }};

        that.each(function() {
          var schedule = set$1(this, id),
              on = schedule.on;

          // If this node shared a dispatch with the previous node,
          // just assign the updated shared dispatch and we’re done!
          // Otherwise, copy-on-write.
          if (on !== on0) {
            on1 = (on0 = on).copy();
            on1._.cancel.push(cancel);
            on1._.interrupt.push(cancel);
            on1._.end.push(end);
          }

          schedule.on = on1;
        });

        // The selection was empty, resolve end immediately
        if (size === 0) resolve();
      });
    }

    var id = 0;

    function Transition(groups, parents, name, id) {
      this._groups = groups;
      this._parents = parents;
      this._name = name;
      this._id = id;
    }

    function transition(name) {
      return selection().transition(name);
    }

    function newId() {
      return ++id;
    }

    var selection_prototype = selection.prototype;

    Transition.prototype = transition.prototype = {
      constructor: Transition,
      select: transition_select,
      selectAll: transition_selectAll,
      filter: transition_filter,
      merge: transition_merge,
      selection: transition_selection,
      transition: transition_transition,
      call: selection_prototype.call,
      nodes: selection_prototype.nodes,
      node: selection_prototype.node,
      size: selection_prototype.size,
      empty: selection_prototype.empty,
      each: selection_prototype.each,
      on: transition_on,
      attr: transition_attr,
      attrTween: transition_attrTween,
      style: transition_style,
      styleTween: transition_styleTween,
      text: transition_text,
      textTween: transition_textTween,
      remove: transition_remove,
      tween: transition_tween,
      delay: transition_delay,
      duration: transition_duration,
      ease: transition_ease,
      easeVarying: transition_easeVarying,
      end: transition_end,
      [Symbol.iterator]: selection_prototype[Symbol.iterator]
    };

    function cubicInOut(t) {
      return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
    }

    var defaultTiming = {
      time: null, // Set on use.
      delay: 0,
      duration: 250,
      ease: cubicInOut
    };

    function inherit(node, id) {
      var timing;
      while (!(timing = node.__transition) || !(timing = timing[id])) {
        if (!(node = node.parentNode)) {
          throw new Error(`transition ${id} not found`);
        }
      }
      return timing;
    }

    function selection_transition(name) {
      var id,
          timing;

      if (name instanceof Transition) {
        id = name._id, name = name._name;
      } else {
        id = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
      }

      for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            schedule(node, name, id, i, group, timing || inherit(node, id));
          }
        }
      }

      return new Transition(groups, this._parents, name, id);
    }

    selection.prototype.interrupt = selection_interrupt;
    selection.prototype.transition = selection_transition;

    // const rawData = ["LAND ROVER", 108, 32821, 304, 47, "43,5%", "LEXUS", 53, 21852, 412, 26, "49,1%", "AUDI", 674, 287176, 426, 218, "32,3%", "VOLKSWAGEN", 1514, 1045121, 690, 503, "33,2%", "BMW", 488, 357967, 734, 184, "37,7%", "FIAT", 403, 336249, 834, 139, "34,5%", "MERCEDES-BENZ", 404, 356857, 883, 153, "37,9%", "PORSCHE", 39, 39326, 1008, 14, "35,9%", "TOYOTA", 517, 603216, 1167, 164, "31,7%", "MINI", 78, 104384, 1338, 22, "28,2%", "RENAULT", 492, 660774, 1343, 215, "43,7%", "SEAT", 147, 215960, 1469, 67, "45,6%", "PEUGEOT", 387, 697193, 1802, 194, "50,1%", "ALFA ROMEO", 29, 57151, 1971, 18, "62,1%", "MAZDA", 75, 159327, 2124, 27, "36,0%", "FORD", 266, 613509, 2306, 130, "48,9%", "OPEL", 306, 732866, 2395, 202, "66,0%", "CITROEN", 168, 406261, 2418, 92, "54,8%", "VOLVO", 145, 370225, 2553, 80, "55,2%", "DAIHATSU", 21, 61491, 2928, 16, "76,2%", "HONDA", 27, 81895, 3033, 18, "66,7%", "NISSAN", 76, 235505, 3099, 43, "56,6%", "CHEVROLET", 24, 75099, 3129, 13, "54,2%", "MITSUBISHI", 43, 139115, 3235, 34, "79,1%", "SKODA", 59, 194952, 3304, 31, "52,5%", "KIA", 79, 284905, 3606, 66, "83,5%", "SUZUKI", 61, 270794, 4439, 38, "62,3%", "HYUNDAI", 59, 266909, 4524, 43, "72,9%", "OVERIGE", 179, 453590, 2534, 78, "43,6%"]
    //
    // const dataList = ["merk", "gestolen", "wagenpark", "diefstalrisico", "terug", "percentageTerug"];
    // const dataPerGroup = dataList.length;
    //
    // const data = []
    //
    // for (var i = 0; i < rawData.length / dataPerGroup; i++) {
    //   let dataObject = {}
    //   for (var x = 0; x < dataPerGroup; x++) {
    //     dataObject[dataList[x]] = rawData[i * dataPerGroup + x]
    //   }
    //   data.push(dataObject);
    // }

    const diefstalrisico = [
      {
        "merk": "LAND ROVER",
        "gestolen": 108,
        "wagenpark": 32821,
        "diefstalrisico": 304,
        "terug": 47,
        "percentageTerug": "43,5%"
      },
      {
        "merk": "LEXUS",
        "gestolen": 53,
        "wagenpark": 21852,
        "diefstalrisico": 412,
        "terug": 26,
        "percentageTerug": "49,1%"
      },
      {
        "merk": "AUDI",
        "gestolen": 674,
        "wagenpark": 287176,
        "diefstalrisico": 426,
        "terug": 218,
        "percentageTerug": "32,3%"
      },
      {
        "merk": "VOLKSWAGEN",
        "gestolen": 1514,
        "wagenpark": 1045121,
        "diefstalrisico": 690,
        "terug": 503,
        "percentageTerug": "33,2%"
      },
      {
        "merk": "BMW",
        "gestolen": 488,
        "wagenpark": 357967,
        "diefstalrisico": 734,
        "terug": 184,
        "percentageTerug": "37,7%"
      },
      {
        "merk": "FIAT",
        "gestolen": 403,
        "wagenpark": 336249,
        "diefstalrisico": 834,
        "terug": 139,
        "percentageTerug": "34,5%"
      },
      {
        "merk": "MERCEDES-BENZ",
        "gestolen": 404,
        "wagenpark": 356857,
        "diefstalrisico": 883,
        "terug": 153,
        "percentageTerug": "37,9%"
      },
      {
        "merk": "PORSCHE",
        "gestolen": 39,
        "wagenpark": 39326,
        "diefstalrisico": 1008,
        "terug": 14,
        "percentageTerug": "35,9%"
      },
      {
        "merk": "TOYOTA",
        "gestolen": 517,
        "wagenpark": 603216,
        "diefstalrisico": 1167,
        "terug": 164,
        "percentageTerug": "31,7%"
      },
      {
        "merk": "MINI",
        "gestolen": 78,
        "wagenpark": 104384,
        "diefstalrisico": 1338,
        "terug": 22,
        "percentageTerug": "28,2%"
      },
      {
        "merk": "RENAULT",
        "gestolen": 492,
        "wagenpark": 660774,
        "diefstalrisico": 1343,
        "terug": 215,
        "percentageTerug": "43,7%"
      },
      {
        "merk": "SEAT",
        "gestolen": 147,
        "wagenpark": 215960,
        "diefstalrisico": 1469,
        "terug": 67,
        "percentageTerug": "45,6%"
      },
      {
        "merk": "PEUGEOT",
        "gestolen": 387,
        "wagenpark": 697193,
        "diefstalrisico": 1802,
        "terug": 194,
        "percentageTerug": "50,1%"
      },
      {
        "merk": "ALFA ROMEO",
        "gestolen": 29,
        "wagenpark": 57151,
        "diefstalrisico": 1971,
        "terug": 18,
        "percentageTerug": "62,1%"
      },
      {
        "merk": "MAZDA",
        "gestolen": 75,
        "wagenpark": 159327,
        "diefstalrisico": 2124,
        "terug": 27,
        "percentageTerug": "36,0%"
      },
      {
        "merk": "FORD",
        "gestolen": 266,
        "wagenpark": 613509,
        "diefstalrisico": 2306,
        "terug": 130,
        "percentageTerug": "48,9%"
      },
      {
        "merk": "OPEL",
        "gestolen": 306,
        "wagenpark": 732866,
        "diefstalrisico": 2395,
        "terug": 202,
        "percentageTerug": "66,0%"
      },
      {
        "merk": "CITROEN",
        "gestolen": 168,
        "wagenpark": 406261,
        "diefstalrisico": 2418,
        "terug": 92,
        "percentageTerug": "54,8%"
      },
      {
        "merk": "VOLVO",
        "gestolen": 145,
        "wagenpark": 370225,
        "diefstalrisico": 2553,
        "terug": 80,
        "percentageTerug": "55,2%"
      },
      {
        "merk": "DAIHATSU",
        "gestolen": 21,
        "wagenpark": 61491,
        "diefstalrisico": 2928,
        "terug": 16,
        "percentageTerug": "76,2%"
      },
      {
        "merk": "HONDA",
        "gestolen": 27,
        "wagenpark": 81895,
        "diefstalrisico": 3033,
        "terug": 18,
        "percentageTerug": "66,7%"
      },
      {
        "merk": "NISSAN",
        "gestolen": 76,
        "wagenpark": 235505,
        "diefstalrisico": 3099,
        "terug": 43,
        "percentageTerug": "56,6%"
      },
      {
        "merk": "CHEVROLET",
        "gestolen": 24,
        "wagenpark": 75099,
        "diefstalrisico": 3129,
        "terug": 13,
        "percentageTerug": "54,2%"
      },
      {
        "merk": "MITSUBISHI",
        "gestolen": 43,
        "wagenpark": 139115,
        "diefstalrisico": 3235,
        "terug": 34,
        "percentageTerug": "79,1%"
      },
      {
        "merk": "SKODA",
        "gestolen": 59,
        "wagenpark": 194952,
        "diefstalrisico": 3304,
        "terug": 31,
        "percentageTerug": "52,5%"
      },
      {
        "merk": "KIA",
        "gestolen": 79,
        "wagenpark": 284905,
        "diefstalrisico": 3606,
        "terug": 66,
        "percentageTerug": "83,5%"
      },
      {
        "merk": "SUZUKI",
        "gestolen": 61,
        "wagenpark": 270794,
        "diefstalrisico": 4439,
        "terug": 38,
        "percentageTerug": "62,3%"
      },
      {
        "merk": "HYUNDAI",
        "gestolen": 59,
        "wagenpark": 266909,
        "diefstalrisico": 4524,
        "terug": 43,
        "percentageTerug": "72,9%"
      },
      {
        "merk": "OVERIGE",
        "gestolen": 179,
        "wagenpark": 453590,
        "diefstalrisico": 2534,
        "terug": 78,
        "percentageTerug": "43,6%"
      }
    ];

    const diefstalrisicoTypes = [
      {
        "merk": "AUDI A1",
        "gestolen": 214,
        "wagenpark": 27449,
        "diefstalrisico": 128,
        "terug": 33,
        "percentageTerug": "15,4%",
      },
      {
        "merk": "TOYOTA C-HR",
        "gestolen": 120,
        "wagenpark": 15797,
        "diefstalrisico": 132,
        "terug": 22,
        "percentageTerug": "18,3%"
      },
      {
        "merk": "MERCEDES-BENZ E-KLASSE",
        "gestolen": 112,
        "wagenpark": 38947,
        "diefstalrisico": 348,
        "terug": 46,
        "percentageTerug": "41,1%",
      },
      {
        "merk": "FIAT 500",
        "gestolen": 222,
        "wagenpark": 94296,
        "diefstalrisico": 425,
        "terug": 44,
        "percentageTerug": "19,8%",
      },
      {
        "merk": "VOLKSWAGEN POLO",
        "gestolen": 584,
        "wagenpark": 277768,
        "diefstalrisico": 476,
        "terug": 168,
        "percentageTerug": "28,8%",
      },
      {
        "merk": "BMW 5ER REIHE",
        "gestolen": 121,
        "wagenpark": 59495,
        "diefstalrisico": 492,
        "terug": 48,
        "percentageTerug": "39,7%",
      },
      {
        "merk": "VOLKSWAGEN GOLF",
        "gestolen": 582,
        "wagenpark": 333040,
        "diefstalrisico": 572,
        "terug": 187,
        "percentageTerug": "32,1%",
      },
      {
        "merk": "AUDI A4",
        "gestolen": 107,
        "wagenpark": 66357,
        "diefstalrisico": 620,
        "terug": 42,
        "percentageTerug": "39,3%",
      },
      {
        "merk": "AUDI A3",
        "gestolen": 113,
        "wagenpark": 79094,
        "diefstalrisico": 700,
        "terug": 51,
        "percentageTerug": "45,1%",
      },
      {
        "merk": "BMW 3ER REIHE",
        "gestolen": 165,
        "wagenpark": 124034,
        "diefstalrisico": 752,
        "terug": 66,
        "percentageTerug": "40,0%",
      },
      {
        "merk": "TOTOTA AYGO",
        "gestolen": 148,
        "wagenpark": 147340,
        "diefstalrisico": 996,
        "terug": 42,
        "percentageTerug": "28,4%",
      },
      {
        "merk": "RENAULT MEGANE",
        "gestolen": 101,
        "wagenpark": 100866,
        "diefstalrisico": 999,
        "terug": 65,
        "percentageTerug": "64,4%",
      },
      {
        "merk": "RENAULT CLIO",
        "gestolen": 163,
        "wagenpark": 176225,
        "diefstalrisico": 1081,
        "terug": 62,
        "percentageTerug": "38,0%",
      },
      {
        "merk": "OPEL CORSA",
        "gestolen": 131,
        "wagenpark": 207961,
        "diefstalrisico": 1587,
        "terug": 89,
        "percentageTerug": "67,9%",
      },
    ];

    const diefstalrisicoHeaders = {
      "merk": {
        "title": "Merk/Type",
        "order": "descending",
        "inverted": false
      },
      "gestolen": {
        "title": "Aantal Gestolen",
        "order": "descending",
        "inverted": false
      },
      "wagenpark": {
        "title": "Totaal Wagenpark",
        "order": "descending",
        "inverted": false
      },
      "diefstalrisico": {
        "title": "Diefstalrisico 1 op ",
        "order": "ascending",
        "inverted": true
      },
      "terug": {
        "title": "Aantal Teruggevonden",
        "order": "ascending",
        "inverted": true
      },
      "percentageTerug": {
        "title": "Percentage Teruggevonden",
        "order": "ascending",
        "inverted": true
      }
    };

    /* src/components/BarChart.svelte generated by Svelte v3.29.7 */

    const { Object: Object_1 } = globals;

    const file$2 = "src/components/BarChart.svelte";

    function create_fragment$2(ctx) {
    	let section;
    	let t;
    	let select_1;
    	let updating_selected;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	function select_1_selected_binding(value) {
    		/*select_1_selected_binding*/ ctx[8].call(null, value);
    	}

    	let select_1_props = {
    		selectionValues: /*selectionValues*/ ctx[0],
    		storageKey: 87658744
    	};

    	if (/*selected*/ ctx[2] !== void 0) {
    		select_1_props.selected = /*selected*/ ctx[2];
    	}

    	select_1 = new Select({ props: select_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(select_1, "selected", select_1_selected_binding));

    	const block = {
    		c: function create() {
    			section = element("section");
    			if (default_slot) default_slot.c();
    			t = space();
    			create_component(select_1.$$.fragment);
    			add_location(section, file$2, 240, 0, 6371);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			if (default_slot) {
    				default_slot.m(section, null);
    			}

    			append_dev(section, t);
    			mount_component(select_1, section, null);
    			/*section_binding*/ ctx[9](section);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 64) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[6], dirty, null, null);
    				}
    			}

    			const select_1_changes = {};
    			if (dirty & /*selectionValues*/ 1) select_1_changes.selectionValues = /*selectionValues*/ ctx[0];

    			if (!updating_selected && dirty & /*selected*/ 4) {
    				updating_selected = true;
    				select_1_changes.selected = /*selected*/ ctx[2];
    				add_flush_callback(() => updating_selected = false);
    			}

    			select_1.$set(select_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(select_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(select_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (default_slot) default_slot.d(detaching);
    			destroy_component(select_1);
    			/*section_binding*/ ctx[9](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("BarChart", slots, ['default']);
    	let { tooltip } = $$props;
    	let { selectionValues } = $$props;
    	let { options } = $$props;
    	let { titleVar } = $$props;
    	const datasets = [diefstalrisico, diefstalrisicoTypes];
    	const headers = diefstalrisicoHeaders;
    	let el;
    	let selected;

    	/*
      Run Function on afterUpdate (also runs after selection update)
    */
    	afterUpdate(async () => {
    		getDataFromSelection();
    	});

    	window.addEventListener("resize", () => getDataFromSelection(true));

    	/*
      Get Data from Selection and draw Chart
    */
    	function getDataFromSelection(redraw = false) {
    		// Get selection from Select component
    		let selectedList = selected.split(" ");

    		// Get variable used to scale the bar chart from selection
    		const scaleVar = selectedList[1];

    		let data = datasets[0];

    		if (selectedList[0] === "merk") {
    			data = datasets[0];
    		} else {
    			data = datasets[1];
    		}

    		drawChart(scaleVar, data, redraw);
    	}

    	/*
      Draw Bar Chart inside el container using data
    */
    	function drawChart(scaleVar, data, redraw) {
    		// Get container
    		const container = select(el);

    		// Bar color
    		const color = "var(--main-color)";

    		// Background & in bar text color
    		const backgroundColor = "var(--background-color)";

    		// Text color
    		const textColor = "var(--text-color)";

    		// Bar width
    		const barWidth = relativeSize(60);

    		// Bar gap
    		const barGap = 0.1;

    		// Sort function
    		const sort = options.sort || headers[scaleVar].order;

    		// Max display amount
    		let displayAmount = options.displayAmount || data.length;

    		// Set display amount to data.length if bigger than data.length
    		if (displayAmount > data.length) displayAmount = data.length;

    		data = transformData(data);

    		// Calculate total height of chart
    		const height = relativeSize(displayAmount * (barWidth / (displayAmount * 0.25) + barWidth * 0.35));

    		const labelSize = relativeSize(50);

    		// Check if it the chart needs to be redrawn; remove every other svg in the container
    		if (redraw) {
    			container.selectAll("svg").remove();
    		}

    		// If container is empty, create a new svg to draw the chart on
    		if (container.select("svg").empty()) {
    			container.append("svg").attr("width", "100%").attr("height", height);
    		}

    		

    		// Select svg
    		const svg = container.select("svg");

    		// Get total svg width
    		const width = svg.style("width").replace("px", "") - labelSize;

    		// Get highest Number
    		const highestNumber = max(data, item => item[scaleVar]);

    		// Get lowest Number
    		const lowestNumber = min(data, item => item[scaleVar]);

    		// Create x scale
    		let xScale = linear$1().range([0, width]).domain([0, highestNumber]);

    		// Invert xScale if scaleVar is inverted
    		if (diefstalrisicoHeaders[scaleVar].inverted) {
    			xScale = linear$1().range([0, width]).domain([highestNumber + lowestNumber, lowestNumber]);
    		}

    		// Create y scale
    		const yScale = band().domain(data.map(d => d[titleVar])).range([height, 0]).paddingInner(barGap);

    		// Add barchart bars (rectangles)
    		const bars = svg.selectAll("rect").data(data);

    		bars.exit().remove();
    		bars.transition().attr("width", d => xScale(d[scaleVar]));
    		const bar = bars.enter().append("g");

    		bar.append("rect").attr("y", d => yScale(d[titleVar])).attr("height", yScale.bandwidth()).attr("x", 0).attr("width", d => xScale(d[scaleVar])).style("fill", color).on("mousemove", (e, d) => {
    			tooltip.setText(tooltipText(d));
    			tooltip.showTooltip(e);
    		}).on("mouseout", () => {
    			tooltip.hideTooltip();
    		});

    		// Add text displaying titleVar (on top of the bar)
    		const titleVarText = svg.selectAll(".titleVarText").data(data);

    		titleVarText.exit().remove();
    		titleVarText.transition().attr("x", d => xScale(d[scaleVar]) - 12).text(d => d[titleVar]);
    		bar.append("text").attr("class", "titleVarText").attr("y", d => yScale(d[titleVar]) + yScale.bandwidth() / 2).attr("x", d => xScale(d[scaleVar]) - 12).attr("alignment-baseline", "central").attr("text-anchor", "end").style("fill", backgroundColor).style("font-weight", "bold").style("pointer-events", "none").text(d => d[titleVar]);

    		// Add text displaying scaleVar (to the right of the bar)
    		const scaleVarText = svg.selectAll(".scaleVarText").data(data);

    		scaleVarText.exit().remove();
    		scaleVarText.transition().attr("x", d => xScale(d[scaleVar]) + relativeSize(12)).text(d => d[scaleVar]);
    		bar.append("text").attr("class", "scaleVarText").attr("y", d => yScale(d[titleVar]) + yScale.bandwidth() / 2).attr("x", d => xScale(d[scaleVar]) + relativeSize(12)).attr("alignment-baseline", "central").style("fill", textColor).style("font-weight", "bold").style("pointer-events", "none").text(d => d[scaleVar]);

    		/*
      Sort, cut and reverse data
    */
    		function transformData(data) {
    			// Sort data
    			switch (sort) {
    				case "descending":
    					data.sort((x, y) => {
    						return descending(x[scaleVar], y[scaleVar]);
    					});
    					break;
    				case "ascending":
    					data.sort((x, y) => {
    						return ascending$1(x[scaleVar], y[scaleVar]);
    					});
    					break;
    			}

    			// Cut off data past max display amount
    			if (displayAmount) {
    				data = data.slice(0, displayAmount);
    			}

    			// Reverse data because chart renders in reverse
    			data.reverse();

    			return data;
    		}

    		/*
      Create tooltip text displaying information per bar
    */
    		function tooltipText(d) {
    			let tableContent = [];

    			for (const key of Object.keys(d)) {
    				if (key !== titleVar) {
    					const title = headers[key].title || key;
    					const value = d[key].toLocaleString("nl-nl");
    					tableContent.push([title, value]);
    				}
    			}

    			return { title: d[titleVar], table: tableContent };
    		}
    	}

    	const writable_props = ["tooltip", "selectionValues", "options", "titleVar"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BarChart> was created with unknown prop '${key}'`);
    	});

    	function select_1_selected_binding(value) {
    		selected = value;
    		$$invalidate(2, selected);
    	}

    	function section_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			el = $$value;
    			$$invalidate(1, el);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("tooltip" in $$props) $$invalidate(3, tooltip = $$props.tooltip);
    		if ("selectionValues" in $$props) $$invalidate(0, selectionValues = $$props.selectionValues);
    		if ("options" in $$props) $$invalidate(4, options = $$props.options);
    		if ("titleVar" in $$props) $$invalidate(5, titleVar = $$props.titleVar);
    		if ("$$scope" in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Select,
    		Tooltip,
    		relativeSize,
    		afterUpdate,
    		select,
    		selectAll,
    		descending,
    		ascending: ascending$1,
    		max,
    		min,
    		scaleLinear: linear$1,
    		scaleBand: band,
    		axisBottom,
    		axisLeft,
    		transition,
    		diefstalrisico,
    		diefstalrisicoTypes,
    		diefstalrisicoHeaders,
    		tooltip,
    		selectionValues,
    		options,
    		titleVar,
    		datasets,
    		headers,
    		el,
    		selected,
    		getDataFromSelection,
    		drawChart
    	});

    	$$self.$inject_state = $$props => {
    		if ("tooltip" in $$props) $$invalidate(3, tooltip = $$props.tooltip);
    		if ("selectionValues" in $$props) $$invalidate(0, selectionValues = $$props.selectionValues);
    		if ("options" in $$props) $$invalidate(4, options = $$props.options);
    		if ("titleVar" in $$props) $$invalidate(5, titleVar = $$props.titleVar);
    		if ("el" in $$props) $$invalidate(1, el = $$props.el);
    		if ("selected" in $$props) $$invalidate(2, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		selectionValues,
    		el,
    		selected,
    		tooltip,
    		options,
    		titleVar,
    		$$scope,
    		slots,
    		select_1_selected_binding,
    		section_binding
    	];
    }

    class BarChart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			tooltip: 3,
    			selectionValues: 0,
    			options: 4,
    			titleVar: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BarChart",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*tooltip*/ ctx[3] === undefined && !("tooltip" in props)) {
    			console.warn("<BarChart> was created without expected prop 'tooltip'");
    		}

    		if (/*selectionValues*/ ctx[0] === undefined && !("selectionValues" in props)) {
    			console.warn("<BarChart> was created without expected prop 'selectionValues'");
    		}

    		if (/*options*/ ctx[4] === undefined && !("options" in props)) {
    			console.warn("<BarChart> was created without expected prop 'options'");
    		}

    		if (/*titleVar*/ ctx[5] === undefined && !("titleVar" in props)) {
    			console.warn("<BarChart> was created without expected prop 'titleVar'");
    		}
    	}

    	get tooltip() {
    		throw new Error("<BarChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tooltip(value) {
    		throw new Error("<BarChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectionValues() {
    		throw new Error("<BarChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectionValues(value) {
    		throw new Error("<BarChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<BarChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<BarChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get titleVar() {
    		throw new Error("<BarChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set titleVar(value) {
    		throw new Error("<BarChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function identity$4(x) {
      return x;
    }

    function transform(transform) {
      if (transform == null) return identity$4;
      var x0,
          y0,
          kx = transform.scale[0],
          ky = transform.scale[1],
          dx = transform.translate[0],
          dy = transform.translate[1];
      return function(input, i) {
        if (!i) x0 = y0 = 0;
        var j = 2, n = input.length, output = new Array(n);
        output[0] = (x0 += input[0]) * kx + dx;
        output[1] = (y0 += input[1]) * ky + dy;
        while (j < n) output[j] = input[j], ++j;
        return output;
      };
    }

    function bbox(topology) {
      var t = transform(topology.transform), key,
          x0 = Infinity, y0 = x0, x1 = -x0, y1 = -x0;

      function bboxPoint(p) {
        p = t(p);
        if (p[0] < x0) x0 = p[0];
        if (p[0] > x1) x1 = p[0];
        if (p[1] < y0) y0 = p[1];
        if (p[1] > y1) y1 = p[1];
      }

      function bboxGeometry(o) {
        switch (o.type) {
          case "GeometryCollection": o.geometries.forEach(bboxGeometry); break;
          case "Point": bboxPoint(o.coordinates); break;
          case "MultiPoint": o.coordinates.forEach(bboxPoint); break;
        }
      }

      topology.arcs.forEach(function(arc) {
        var i = -1, n = arc.length, p;
        while (++i < n) {
          p = t(arc[i], i);
          if (p[0] < x0) x0 = p[0];
          if (p[0] > x1) x1 = p[0];
          if (p[1] < y0) y0 = p[1];
          if (p[1] > y1) y1 = p[1];
        }
      });

      for (key in topology.objects) {
        bboxGeometry(topology.objects[key]);
      }

      return [x0, y0, x1, y1];
    }

    function reverse(array, n) {
      var t, j = array.length, i = j - n;
      while (i < --j) t = array[i], array[i++] = array[j], array[j] = t;
    }

    function feature(topology, o) {
      return o.type === "GeometryCollection"
          ? {type: "FeatureCollection", features: o.geometries.map(function(o) { return feature$1(topology, o); })}
          : feature$1(topology, o);
    }

    function feature$1(topology, o) {
      var id = o.id,
          bbox = o.bbox,
          properties = o.properties == null ? {} : o.properties,
          geometry = object$1(topology, o);
      return id == null && bbox == null ? {type: "Feature", properties: properties, geometry: geometry}
          : bbox == null ? {type: "Feature", id: id, properties: properties, geometry: geometry}
          : {type: "Feature", id: id, bbox: bbox, properties: properties, geometry: geometry};
    }

    function object$1(topology, o) {
      var transformPoint = transform(topology.transform),
          arcs = topology.arcs;

      function arc(i, points) {
        if (points.length) points.pop();
        for (var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length; k < n; ++k) {
          points.push(transformPoint(a[k], k));
        }
        if (i < 0) reverse(points, n);
      }

      function point(p) {
        return transformPoint(p);
      }

      function line(arcs) {
        var points = [];
        for (var i = 0, n = arcs.length; i < n; ++i) arc(arcs[i], points);
        if (points.length < 2) points.push(points[0]); // This should never happen per the specification.
        return points;
      }

      function ring(arcs) {
        var points = line(arcs);
        while (points.length < 4) points.push(points[0]); // This may happen if an arc has only two points.
        return points;
      }

      function polygon(arcs) {
        return arcs.map(ring);
      }

      function geometry(o) {
        var type = o.type, coordinates;
        switch (type) {
          case "GeometryCollection": return {type: type, geometries: o.geometries.map(geometry)};
          case "Point": coordinates = point(o.coordinates); break;
          case "MultiPoint": coordinates = o.coordinates.map(point); break;
          case "LineString": coordinates = line(o.arcs); break;
          case "MultiLineString": coordinates = o.arcs.map(line); break;
          case "Polygon": coordinates = polygon(o.arcs); break;
          case "MultiPolygon": coordinates = o.arcs.map(polygon); break;
          default: return null;
        }
        return {type: type, coordinates: coordinates};
      }

      return geometry(o);
    }

    function stitch(topology, arcs) {
      var stitchedArcs = {},
          fragmentByStart = {},
          fragmentByEnd = {},
          fragments = [],
          emptyIndex = -1;

      // Stitch empty arcs first, since they may be subsumed by other arcs.
      arcs.forEach(function(i, j) {
        var arc = topology.arcs[i < 0 ? ~i : i], t;
        if (arc.length < 3 && !arc[1][0] && !arc[1][1]) {
          t = arcs[++emptyIndex], arcs[emptyIndex] = i, arcs[j] = t;
        }
      });

      arcs.forEach(function(i) {
        var e = ends(i),
            start = e[0],
            end = e[1],
            f, g;

        if (f = fragmentByEnd[start]) {
          delete fragmentByEnd[f.end];
          f.push(i);
          f.end = end;
          if (g = fragmentByStart[end]) {
            delete fragmentByStart[g.start];
            var fg = g === f ? f : f.concat(g);
            fragmentByStart[fg.start = f.start] = fragmentByEnd[fg.end = g.end] = fg;
          } else {
            fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
          }
        } else if (f = fragmentByStart[end]) {
          delete fragmentByStart[f.start];
          f.unshift(i);
          f.start = start;
          if (g = fragmentByEnd[start]) {
            delete fragmentByEnd[g.end];
            var gf = g === f ? f : g.concat(f);
            fragmentByStart[gf.start = g.start] = fragmentByEnd[gf.end = f.end] = gf;
          } else {
            fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
          }
        } else {
          f = [i];
          fragmentByStart[f.start = start] = fragmentByEnd[f.end = end] = f;
        }
      });

      function ends(i) {
        var arc = topology.arcs[i < 0 ? ~i : i], p0 = arc[0], p1;
        if (topology.transform) p1 = [0, 0], arc.forEach(function(dp) { p1[0] += dp[0], p1[1] += dp[1]; });
        else p1 = arc[arc.length - 1];
        return i < 0 ? [p1, p0] : [p0, p1];
      }

      function flush(fragmentByEnd, fragmentByStart) {
        for (var k in fragmentByEnd) {
          var f = fragmentByEnd[k];
          delete fragmentByStart[f.start];
          delete f.start;
          delete f.end;
          f.forEach(function(i) { stitchedArcs[i < 0 ? ~i : i] = 1; });
          fragments.push(f);
        }
      }

      flush(fragmentByEnd, fragmentByStart);
      flush(fragmentByStart, fragmentByEnd);
      arcs.forEach(function(i) { if (!stitchedArcs[i < 0 ? ~i : i]) fragments.push([i]); });

      return fragments;
    }

    function mesh(topology) {
      return object$1(topology, meshArcs.apply(this, arguments));
    }

    function meshArcs(topology, object, filter) {
      var arcs, i, n;
      if (arguments.length > 1) arcs = extractArcs(topology, object, filter);
      else for (i = 0, arcs = new Array(n = topology.arcs.length); i < n; ++i) arcs[i] = i;
      return {type: "MultiLineString", arcs: stitch(topology, arcs)};
    }

    function extractArcs(topology, object, filter) {
      var arcs = [],
          geomsByArc = [],
          geom;

      function extract0(i) {
        var j = i < 0 ? ~i : i;
        (geomsByArc[j] || (geomsByArc[j] = [])).push({i: i, g: geom});
      }

      function extract1(arcs) {
        arcs.forEach(extract0);
      }

      function extract2(arcs) {
        arcs.forEach(extract1);
      }

      function extract3(arcs) {
        arcs.forEach(extract2);
      }

      function geometry(o) {
        switch (geom = o, o.type) {
          case "GeometryCollection": o.geometries.forEach(geometry); break;
          case "LineString": extract1(o.arcs); break;
          case "MultiLineString": case "Polygon": extract2(o.arcs); break;
          case "MultiPolygon": extract3(o.arcs); break;
        }
      }

      geometry(object);

      geomsByArc.forEach(filter == null
          ? function(geoms) { arcs.push(geoms[0].i); }
          : function(geoms) { if (filter(geoms[0].g, geoms[geoms.length - 1].g)) arcs.push(geoms[0].i); });

      return arcs;
    }

    function planarRingArea(ring) {
      var i = -1, n = ring.length, a, b = ring[n - 1], area = 0;
      while (++i < n) a = b, b = ring[i], area += a[0] * b[1] - a[1] * b[0];
      return Math.abs(area); // Note: doubled area!
    }

    function merge$1(topology) {
      return object$1(topology, mergeArcs.apply(this, arguments));
    }

    function mergeArcs(topology, objects) {
      var polygonsByArc = {},
          polygons = [],
          groups = [];

      objects.forEach(geometry);

      function geometry(o) {
        switch (o.type) {
          case "GeometryCollection": o.geometries.forEach(geometry); break;
          case "Polygon": extract(o.arcs); break;
          case "MultiPolygon": o.arcs.forEach(extract); break;
        }
      }

      function extract(polygon) {
        polygon.forEach(function(ring) {
          ring.forEach(function(arc) {
            (polygonsByArc[arc = arc < 0 ? ~arc : arc] || (polygonsByArc[arc] = [])).push(polygon);
          });
        });
        polygons.push(polygon);
      }

      function area(ring) {
        return planarRingArea(object$1(topology, {type: "Polygon", arcs: [ring]}).coordinates[0]);
      }

      polygons.forEach(function(polygon) {
        if (!polygon._) {
          var group = [],
              neighbors = [polygon];
          polygon._ = 1;
          groups.push(group);
          while (polygon = neighbors.pop()) {
            group.push(polygon);
            polygon.forEach(function(ring) {
              ring.forEach(function(arc) {
                polygonsByArc[arc < 0 ? ~arc : arc].forEach(function(polygon) {
                  if (!polygon._) {
                    polygon._ = 1;
                    neighbors.push(polygon);
                  }
                });
              });
            });
          }
        }
      });

      polygons.forEach(function(polygon) {
        delete polygon._;
      });

      return {
        type: "MultiPolygon",
        arcs: groups.map(function(polygons) {
          var arcs = [], n;

          // Extract the exterior (unique) arcs.
          polygons.forEach(function(polygon) {
            polygon.forEach(function(ring) {
              ring.forEach(function(arc) {
                if (polygonsByArc[arc < 0 ? ~arc : arc].length < 2) {
                  arcs.push(arc);
                }
              });
            });
          });

          // Stitch the arcs into one or more rings.
          arcs = stitch(topology, arcs);

          // If more than one ring is returned,
          // at most one of these rings can be the exterior;
          // choose the one with the greatest absolute area.
          if ((n = arcs.length) > 1) {
            for (var i = 1, k = area(arcs[0]), ki, t; i < n; ++i) {
              if ((ki = area(arcs[i])) > k) {
                t = arcs[0], arcs[0] = arcs[i], arcs[i] = t, k = ki;
              }
            }
          }

          return arcs;
        })
      };
    }

    function bisect(a, x) {
      var lo = 0, hi = a.length;
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (a[mid] < x) lo = mid + 1;
        else hi = mid;
      }
      return lo;
    }

    function neighbors(objects) {
      var indexesByArc = {}, // arc index -> array of object indexes
          neighbors = objects.map(function() { return []; });

      function line(arcs, i) {
        arcs.forEach(function(a) {
          if (a < 0) a = ~a;
          var o = indexesByArc[a];
          if (o) o.push(i);
          else indexesByArc[a] = [i];
        });
      }

      function polygon(arcs, i) {
        arcs.forEach(function(arc) { line(arc, i); });
      }

      function geometry(o, i) {
        if (o.type === "GeometryCollection") o.geometries.forEach(function(o) { geometry(o, i); });
        else if (o.type in geometryType) geometryType[o.type](o.arcs, i);
      }

      var geometryType = {
        LineString: line,
        MultiLineString: polygon,
        Polygon: polygon,
        MultiPolygon: function(arcs, i) { arcs.forEach(function(arc) { polygon(arc, i); }); }
      };

      objects.forEach(geometry);

      for (var i in indexesByArc) {
        for (var indexes = indexesByArc[i], m = indexes.length, j = 0; j < m; ++j) {
          for (var k = j + 1; k < m; ++k) {
            var ij = indexes[j], ik = indexes[k], n;
            if ((n = neighbors[ij])[i = bisect(n, ik)] !== ik) n.splice(i, 0, ik);
            if ((n = neighbors[ik])[i = bisect(n, ij)] !== ij) n.splice(i, 0, ij);
          }
        }
      }

      return neighbors;
    }

    function untransform(transform) {
      if (transform == null) return identity$4;
      var x0,
          y0,
          kx = transform.scale[0],
          ky = transform.scale[1],
          dx = transform.translate[0],
          dy = transform.translate[1];
      return function(input, i) {
        if (!i) x0 = y0 = 0;
        var j = 2,
            n = input.length,
            output = new Array(n),
            x1 = Math.round((input[0] - dx) / kx),
            y1 = Math.round((input[1] - dy) / ky);
        output[0] = x1 - x0, x0 = x1;
        output[1] = y1 - y0, y0 = y1;
        while (j < n) output[j] = input[j], ++j;
        return output;
      };
    }

    function quantize(topology, transform) {
      if (topology.transform) throw new Error("already quantized");

      if (!transform || !transform.scale) {
        if (!((n = Math.floor(transform)) >= 2)) throw new Error("n must be ≥2");
        box = topology.bbox || bbox(topology);
        var x0 = box[0], y0 = box[1], x1 = box[2], y1 = box[3], n;
        transform = {scale: [x1 - x0 ? (x1 - x0) / (n - 1) : 1, y1 - y0 ? (y1 - y0) / (n - 1) : 1], translate: [x0, y0]};
      } else {
        box = topology.bbox;
      }

      var t = untransform(transform), box, key, inputs = topology.objects, outputs = {};

      function quantizePoint(point) {
        return t(point);
      }

      function quantizeGeometry(input) {
        var output;
        switch (input.type) {
          case "GeometryCollection": output = {type: "GeometryCollection", geometries: input.geometries.map(quantizeGeometry)}; break;
          case "Point": output = {type: "Point", coordinates: quantizePoint(input.coordinates)}; break;
          case "MultiPoint": output = {type: "MultiPoint", coordinates: input.coordinates.map(quantizePoint)}; break;
          default: return input;
        }
        if (input.id != null) output.id = input.id;
        if (input.bbox != null) output.bbox = input.bbox;
        if (input.properties != null) output.properties = input.properties;
        return output;
      }

      function quantizeArc(input) {
        var i = 0, j = 1, n = input.length, p, output = new Array(n); // pessimistic
        output[0] = t(input[0], 0);
        while (++i < n) if ((p = t(input[i], i))[0] || p[1]) output[j++] = p; // non-coincident points
        if (j === 1) output[j++] = [0, 0]; // an arc must have at least two points
        output.length = j;
        return output;
      }

      for (key in inputs) outputs[key] = quantizeGeometry(inputs[key]);

      return {
        type: "Topology",
        bbox: box,
        transform: transform,
        objects: outputs,
        arcs: topology.arcs.map(quantizeArc)
      };
    }

    // Computes the bounding box of the specified hash of GeoJSON objects.
    function bounds(objects) {
      var x0 = Infinity,
          y0 = Infinity,
          x1 = -Infinity,
          y1 = -Infinity;

      function boundGeometry(geometry) {
        if (geometry != null && boundGeometryType.hasOwnProperty(geometry.type)) boundGeometryType[geometry.type](geometry);
      }

      var boundGeometryType = {
        GeometryCollection: function(o) { o.geometries.forEach(boundGeometry); },
        Point: function(o) { boundPoint(o.coordinates); },
        MultiPoint: function(o) { o.coordinates.forEach(boundPoint); },
        LineString: function(o) { boundLine(o.arcs); },
        MultiLineString: function(o) { o.arcs.forEach(boundLine); },
        Polygon: function(o) { o.arcs.forEach(boundLine); },
        MultiPolygon: function(o) { o.arcs.forEach(boundMultiLine); }
      };

      function boundPoint(coordinates) {
        var x = coordinates[0],
            y = coordinates[1];
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }

      function boundLine(coordinates) {
        coordinates.forEach(boundPoint);
      }

      function boundMultiLine(coordinates) {
        coordinates.forEach(boundLine);
      }

      for (var key in objects) {
        boundGeometry(objects[key]);
      }

      return x1 >= x0 && y1 >= y0 ? [x0, y0, x1, y1] : undefined;
    }

    function hashset(size, hash, equal, type, empty) {
      if (arguments.length === 3) {
        type = Array;
        empty = null;
      }

      var store = new type(size = 1 << Math.max(4, Math.ceil(Math.log(size) / Math.LN2))),
          mask = size - 1;

      for (var i = 0; i < size; ++i) {
        store[i] = empty;
      }

      function add(value) {
        var index = hash(value) & mask,
            match = store[index],
            collisions = 0;
        while (match != empty) {
          if (equal(match, value)) return true;
          if (++collisions >= size) throw new Error("full hashset");
          match = store[index = (index + 1) & mask];
        }
        store[index] = value;
        return true;
      }

      function has(value) {
        var index = hash(value) & mask,
            match = store[index],
            collisions = 0;
        while (match != empty) {
          if (equal(match, value)) return true;
          if (++collisions >= size) break;
          match = store[index = (index + 1) & mask];
        }
        return false;
      }

      function values() {
        var values = [];
        for (var i = 0, n = store.length; i < n; ++i) {
          var match = store[i];
          if (match != empty) values.push(match);
        }
        return values;
      }

      return {
        add: add,
        has: has,
        values: values
      };
    }

    function hashmap(size, hash, equal, keyType, keyEmpty, valueType) {
      if (arguments.length === 3) {
        keyType = valueType = Array;
        keyEmpty = null;
      }

      var keystore = new keyType(size = 1 << Math.max(4, Math.ceil(Math.log(size) / Math.LN2))),
          valstore = new valueType(size),
          mask = size - 1;

      for (var i = 0; i < size; ++i) {
        keystore[i] = keyEmpty;
      }

      function set(key, value) {
        var index = hash(key) & mask,
            matchKey = keystore[index],
            collisions = 0;
        while (matchKey != keyEmpty) {
          if (equal(matchKey, key)) return valstore[index] = value;
          if (++collisions >= size) throw new Error("full hashmap");
          matchKey = keystore[index = (index + 1) & mask];
        }
        keystore[index] = key;
        valstore[index] = value;
        return value;
      }

      function maybeSet(key, value) {
        var index = hash(key) & mask,
            matchKey = keystore[index],
            collisions = 0;
        while (matchKey != keyEmpty) {
          if (equal(matchKey, key)) return valstore[index];
          if (++collisions >= size) throw new Error("full hashmap");
          matchKey = keystore[index = (index + 1) & mask];
        }
        keystore[index] = key;
        valstore[index] = value;
        return value;
      }

      function get(key, missingValue) {
        var index = hash(key) & mask,
            matchKey = keystore[index],
            collisions = 0;
        while (matchKey != keyEmpty) {
          if (equal(matchKey, key)) return valstore[index];
          if (++collisions >= size) break;
          matchKey = keystore[index = (index + 1) & mask];
        }
        return missingValue;
      }

      function keys() {
        var keys = [];
        for (var i = 0, n = keystore.length; i < n; ++i) {
          var matchKey = keystore[i];
          if (matchKey != keyEmpty) keys.push(matchKey);
        }
        return keys;
      }

      return {
        set: set,
        maybeSet: maybeSet, // set if unset
        get: get,
        keys: keys
      };
    }

    function equalPoint(pointA, pointB) {
      return pointA[0] === pointB[0] && pointA[1] === pointB[1];
    }

    // TODO if quantized, use simpler Int32 hashing?

    var buffer = new ArrayBuffer(16),
        floats = new Float64Array(buffer),
        uints = new Uint32Array(buffer);

    function hashPoint(point) {
      floats[0] = point[0];
      floats[1] = point[1];
      var hash = uints[0] ^ uints[1];
      hash = hash << 5 ^ hash >> 7 ^ uints[2] ^ uints[3];
      return hash & 0x7fffffff;
    }

    // Given an extracted (pre-)topology, identifies all of the junctions. These are
    // the points at which arcs (lines or rings) will need to be cut so that each
    // arc is represented uniquely.
    //
    // A junction is a point where at least one arc deviates from another arc going
    // through the same point. For example, consider the point B. If there is a arc
    // through ABC and another arc through CBA, then B is not a junction because in
    // both cases the adjacent point pairs are {A,C}. However, if there is an
    // additional arc ABD, then {A,D} != {A,C}, and thus B becomes a junction.
    //
    // For a closed ring ABCA, the first point A’s adjacent points are the second
    // and last point {B,C}. For a line, the first and last point are always
    // considered junctions, even if the line is closed; this ensures that a closed
    // line is never rotated.
    function join(topology) {
      var coordinates = topology.coordinates,
          lines = topology.lines,
          rings = topology.rings,
          indexes = index(),
          visitedByIndex = new Int32Array(coordinates.length),
          leftByIndex = new Int32Array(coordinates.length),
          rightByIndex = new Int32Array(coordinates.length),
          junctionByIndex = new Int8Array(coordinates.length),
          junctionCount = 0, // upper bound on number of junctions
          i, n,
          previousIndex,
          currentIndex,
          nextIndex;

      for (i = 0, n = coordinates.length; i < n; ++i) {
        visitedByIndex[i] = leftByIndex[i] = rightByIndex[i] = -1;
      }

      for (i = 0, n = lines.length; i < n; ++i) {
        var line = lines[i],
            lineStart = line[0],
            lineEnd = line[1];
        currentIndex = indexes[lineStart];
        nextIndex = indexes[++lineStart];
        ++junctionCount, junctionByIndex[currentIndex] = 1; // start
        while (++lineStart <= lineEnd) {
          sequence(i, previousIndex = currentIndex, currentIndex = nextIndex, nextIndex = indexes[lineStart]);
        }
        ++junctionCount, junctionByIndex[nextIndex] = 1; // end
      }

      for (i = 0, n = coordinates.length; i < n; ++i) {
        visitedByIndex[i] = -1;
      }

      for (i = 0, n = rings.length; i < n; ++i) {
        var ring = rings[i],
            ringStart = ring[0] + 1,
            ringEnd = ring[1];
        previousIndex = indexes[ringEnd - 1];
        currentIndex = indexes[ringStart - 1];
        nextIndex = indexes[ringStart];
        sequence(i, previousIndex, currentIndex, nextIndex);
        while (++ringStart <= ringEnd) {
          sequence(i, previousIndex = currentIndex, currentIndex = nextIndex, nextIndex = indexes[ringStart]);
        }
      }

      function sequence(i, previousIndex, currentIndex, nextIndex) {
        if (visitedByIndex[currentIndex] === i) return; // ignore self-intersection
        visitedByIndex[currentIndex] = i;
        var leftIndex = leftByIndex[currentIndex];
        if (leftIndex >= 0) {
          var rightIndex = rightByIndex[currentIndex];
          if ((leftIndex !== previousIndex || rightIndex !== nextIndex)
            && (leftIndex !== nextIndex || rightIndex !== previousIndex)) {
            ++junctionCount, junctionByIndex[currentIndex] = 1;
          }
        } else {
          leftByIndex[currentIndex] = previousIndex;
          rightByIndex[currentIndex] = nextIndex;
        }
      }

      function index() {
        var indexByPoint = hashmap(coordinates.length * 1.4, hashIndex, equalIndex, Int32Array, -1, Int32Array),
            indexes = new Int32Array(coordinates.length);

        for (var i = 0, n = coordinates.length; i < n; ++i) {
          indexes[i] = indexByPoint.maybeSet(i, i);
        }

        return indexes;
      }

      function hashIndex(i) {
        return hashPoint(coordinates[i]);
      }

      function equalIndex(i, j) {
        return equalPoint(coordinates[i], coordinates[j]);
      }

      visitedByIndex = leftByIndex = rightByIndex = null;

      var junctionByPoint = hashset(junctionCount * 1.4, hashPoint, equalPoint), j;

      // Convert back to a standard hashset by point for caller convenience.
      for (i = 0, n = coordinates.length; i < n; ++i) {
        if (junctionByIndex[j = indexes[i]]) {
          junctionByPoint.add(coordinates[j]);
        }
      }

      return junctionByPoint;
    }

    // Given an extracted (pre-)topology, cuts (or rotates) arcs so that all shared
    // point sequences are identified. The topology can then be subsequently deduped
    // to remove exact duplicate arcs.
    function cut(topology) {
      var junctions = join(topology),
          coordinates = topology.coordinates,
          lines = topology.lines,
          rings = topology.rings,
          next,
          i, n;

      for (i = 0, n = lines.length; i < n; ++i) {
        var line = lines[i],
            lineMid = line[0],
            lineEnd = line[1];
        while (++lineMid < lineEnd) {
          if (junctions.has(coordinates[lineMid])) {
            next = {0: lineMid, 1: line[1]};
            line[1] = lineMid;
            line = line.next = next;
          }
        }
      }

      for (i = 0, n = rings.length; i < n; ++i) {
        var ring = rings[i],
            ringStart = ring[0],
            ringMid = ringStart,
            ringEnd = ring[1],
            ringFixed = junctions.has(coordinates[ringStart]);
        while (++ringMid < ringEnd) {
          if (junctions.has(coordinates[ringMid])) {
            if (ringFixed) {
              next = {0: ringMid, 1: ring[1]};
              ring[1] = ringMid;
              ring = ring.next = next;
            } else { // For the first junction, we can rotate rather than cut.
              rotateArray(coordinates, ringStart, ringEnd, ringEnd - ringMid);
              coordinates[ringEnd] = coordinates[ringStart];
              ringFixed = true;
              ringMid = ringStart; // restart; we may have skipped junctions
            }
          }
        }
      }

      return topology;
    }

    function rotateArray(array, start, end, offset) {
      reverse$1(array, start, end);
      reverse$1(array, start, start + offset);
      reverse$1(array, start + offset, end);
    }

    function reverse$1(array, start, end) {
      for (var mid = start + ((end-- - start) >> 1), t; start < mid; ++start, --end) {
        t = array[start], array[start] = array[end], array[end] = t;
      }
    }

    // Given a cut topology, combines duplicate arcs.
    function dedup(topology) {
      var coordinates = topology.coordinates,
          lines = topology.lines, line,
          rings = topology.rings, ring,
          arcCount = lines.length + rings.length,
          i, n;

      delete topology.lines;
      delete topology.rings;

      // Count the number of (non-unique) arcs to initialize the hashmap safely.
      for (i = 0, n = lines.length; i < n; ++i) {
        line = lines[i]; while (line = line.next) ++arcCount;
      }
      for (i = 0, n = rings.length; i < n; ++i) {
        ring = rings[i]; while (ring = ring.next) ++arcCount;
      }

      var arcsByEnd = hashmap(arcCount * 2 * 1.4, hashPoint, equalPoint),
          arcs = topology.arcs = [];

      for (i = 0, n = lines.length; i < n; ++i) {
        line = lines[i];
        do {
          dedupLine(line);
        } while (line = line.next);
      }

      for (i = 0, n = rings.length; i < n; ++i) {
        ring = rings[i];
        if (ring.next) { // arc is no longer closed
          do {
            dedupLine(ring);
          } while (ring = ring.next);
        } else {
          dedupRing(ring);
        }
      }

      function dedupLine(arc) {
        var startPoint,
            endPoint,
            startArcs, startArc,
            endArcs, endArc,
            i, n;

        // Does this arc match an existing arc in order?
        if (startArcs = arcsByEnd.get(startPoint = coordinates[arc[0]])) {
          for (i = 0, n = startArcs.length; i < n; ++i) {
            startArc = startArcs[i];
            if (equalLine(startArc, arc)) {
              arc[0] = startArc[0];
              arc[1] = startArc[1];
              return;
            }
          }
        }

        // Does this arc match an existing arc in reverse order?
        if (endArcs = arcsByEnd.get(endPoint = coordinates[arc[1]])) {
          for (i = 0, n = endArcs.length; i < n; ++i) {
            endArc = endArcs[i];
            if (reverseEqualLine(endArc, arc)) {
              arc[1] = endArc[0];
              arc[0] = endArc[1];
              return;
            }
          }
        }

        if (startArcs) startArcs.push(arc); else arcsByEnd.set(startPoint, [arc]);
        if (endArcs) endArcs.push(arc); else arcsByEnd.set(endPoint, [arc]);
        arcs.push(arc);
      }

      function dedupRing(arc) {
        var endPoint,
            endArcs,
            endArc,
            i, n;

        // Does this arc match an existing line in order, or reverse order?
        // Rings are closed, so their start point and end point is the same.
        if (endArcs = arcsByEnd.get(endPoint = coordinates[arc[0]])) {
          for (i = 0, n = endArcs.length; i < n; ++i) {
            endArc = endArcs[i];
            if (equalRing(endArc, arc)) {
              arc[0] = endArc[0];
              arc[1] = endArc[1];
              return;
            }
            if (reverseEqualRing(endArc, arc)) {
              arc[0] = endArc[1];
              arc[1] = endArc[0];
              return;
            }
          }
        }

        // Otherwise, does this arc match an existing ring in order, or reverse order?
        if (endArcs = arcsByEnd.get(endPoint = coordinates[arc[0] + findMinimumOffset(arc)])) {
          for (i = 0, n = endArcs.length; i < n; ++i) {
            endArc = endArcs[i];
            if (equalRing(endArc, arc)) {
              arc[0] = endArc[0];
              arc[1] = endArc[1];
              return;
            }
            if (reverseEqualRing(endArc, arc)) {
              arc[0] = endArc[1];
              arc[1] = endArc[0];
              return;
            }
          }
        }

        if (endArcs) endArcs.push(arc); else arcsByEnd.set(endPoint, [arc]);
        arcs.push(arc);
      }

      function equalLine(arcA, arcB) {
        var ia = arcA[0], ib = arcB[0],
            ja = arcA[1], jb = arcB[1];
        if (ia - ja !== ib - jb) return false;
        for (; ia <= ja; ++ia, ++ib) if (!equalPoint(coordinates[ia], coordinates[ib])) return false;
        return true;
      }

      function reverseEqualLine(arcA, arcB) {
        var ia = arcA[0], ib = arcB[0],
            ja = arcA[1], jb = arcB[1];
        if (ia - ja !== ib - jb) return false;
        for (; ia <= ja; ++ia, --jb) if (!equalPoint(coordinates[ia], coordinates[jb])) return false;
        return true;
      }

      function equalRing(arcA, arcB) {
        var ia = arcA[0], ib = arcB[0],
            ja = arcA[1], jb = arcB[1],
            n = ja - ia;
        if (n !== jb - ib) return false;
        var ka = findMinimumOffset(arcA),
            kb = findMinimumOffset(arcB);
        for (var i = 0; i < n; ++i) {
          if (!equalPoint(coordinates[ia + (i + ka) % n], coordinates[ib + (i + kb) % n])) return false;
        }
        return true;
      }

      function reverseEqualRing(arcA, arcB) {
        var ia = arcA[0], ib = arcB[0],
            ja = arcA[1], jb = arcB[1],
            n = ja - ia;
        if (n !== jb - ib) return false;
        var ka = findMinimumOffset(arcA),
            kb = n - findMinimumOffset(arcB);
        for (var i = 0; i < n; ++i) {
          if (!equalPoint(coordinates[ia + (i + ka) % n], coordinates[jb - (i + kb) % n])) return false;
        }
        return true;
      }

      // Rings are rotated to a consistent, but arbitrary, start point.
      // This is necessary to detect when a ring and a rotated copy are dupes.
      function findMinimumOffset(arc) {
        var start = arc[0],
            end = arc[1],
            mid = start,
            minimum = mid,
            minimumPoint = coordinates[mid];
        while (++mid < end) {
          var point = coordinates[mid];
          if (point[0] < minimumPoint[0] || point[0] === minimumPoint[0] && point[1] < minimumPoint[1]) {
            minimum = mid;
            minimumPoint = point;
          }
        }
        return minimum - start;
      }

      return topology;
    }

    // Given an array of arcs in absolute (but already quantized!) coordinates,
    // converts to fixed-point delta encoding.
    // This is a destructive operation that modifies the given arcs!
    function delta(arcs) {
      var i = -1,
          n = arcs.length;

      while (++i < n) {
        var arc = arcs[i],
            j = 0,
            k = 1,
            m = arc.length,
            point = arc[0],
            x0 = point[0],
            y0 = point[1],
            x1,
            y1;

        while (++j < m) {
          point = arc[j], x1 = point[0], y1 = point[1];
          if (x1 !== x0 || y1 !== y0) arc[k++] = [x1 - x0, y1 - y0], x0 = x1, y0 = y1;
        }

        if (k === 1) arc[k++] = [0, 0]; // Each arc must be an array of two or more positions.

        arc.length = k;
      }

      return arcs;
    }

    // Extracts the lines and rings from the specified hash of geometry objects.
    //
    // Returns an object with three properties:
    //
    // * coordinates - shared buffer of [x, y] coordinates
    // * lines - lines extracted from the hash, of the form [start, end]
    // * rings - rings extracted from the hash, of the form [start, end]
    //
    // For each ring or line, start and end represent inclusive indexes into the
    // coordinates buffer. For rings (and closed lines), coordinates[start] equals
    // coordinates[end].
    //
    // For each line or polygon geometry in the input hash, including nested
    // geometries as in geometry collections, the `coordinates` array is replaced
    // with an equivalent `arcs` array that, for each line (for line string
    // geometries) or ring (for polygon geometries), points to one of the above
    // lines or rings.
    function extract(objects) {
      var index = -1,
          lines = [],
          rings = [],
          coordinates = [];

      function extractGeometry(geometry) {
        if (geometry && extractGeometryType.hasOwnProperty(geometry.type)) extractGeometryType[geometry.type](geometry);
      }

      var extractGeometryType = {
        GeometryCollection: function(o) { o.geometries.forEach(extractGeometry); },
        LineString: function(o) { o.arcs = extractLine(o.arcs); },
        MultiLineString: function(o) { o.arcs = o.arcs.map(extractLine); },
        Polygon: function(o) { o.arcs = o.arcs.map(extractRing); },
        MultiPolygon: function(o) { o.arcs = o.arcs.map(extractMultiRing); }
      };

      function extractLine(line) {
        for (var i = 0, n = line.length; i < n; ++i) coordinates[++index] = line[i];
        var arc = {0: index - n + 1, 1: index};
        lines.push(arc);
        return arc;
      }

      function extractRing(ring) {
        for (var i = 0, n = ring.length; i < n; ++i) coordinates[++index] = ring[i];
        var arc = {0: index - n + 1, 1: index};
        rings.push(arc);
        return arc;
      }

      function extractMultiRing(rings) {
        return rings.map(extractRing);
      }

      for (var key in objects) {
        extractGeometry(objects[key]);
      }

      return {
        type: "Topology",
        coordinates: coordinates,
        lines: lines,
        rings: rings,
        objects: objects
      };
    }

    // Given a hash of GeoJSON objects, returns a hash of GeoJSON geometry objects.
    // Any null input geometry objects are represented as {type: null} in the output.
    // Any feature.{id,properties,bbox} are transferred to the output geometry object.
    // Each output geometry object is a shallow copy of the input (e.g., properties, coordinates)!
    function geometry(inputs) {
      var outputs = {}, key;
      for (key in inputs) outputs[key] = geomifyObject(inputs[key]);
      return outputs;
    }

    function geomifyObject(input) {
      return input == null ? {type: null}
          : (input.type === "FeatureCollection" ? geomifyFeatureCollection
          : input.type === "Feature" ? geomifyFeature
          : geomifyGeometry)(input);
    }

    function geomifyFeatureCollection(input) {
      var output = {type: "GeometryCollection", geometries: input.features.map(geomifyFeature)};
      if (input.bbox != null) output.bbox = input.bbox;
      return output;
    }

    function geomifyFeature(input) {
      var output = geomifyGeometry(input.geometry), key; // eslint-disable-line no-unused-vars
      if (input.id != null) output.id = input.id;
      if (input.bbox != null) output.bbox = input.bbox;
      for (key in input.properties) { output.properties = input.properties; break; }
      return output;
    }

    function geomifyGeometry(input) {
      if (input == null) return {type: null};
      var output = input.type === "GeometryCollection" ? {type: "GeometryCollection", geometries: input.geometries.map(geomifyGeometry)}
          : input.type === "Point" || input.type === "MultiPoint" ? {type: input.type, coordinates: input.coordinates}
          : {type: input.type, arcs: input.coordinates}; // TODO Check for unknown types?
      if (input.bbox != null) output.bbox = input.bbox;
      return output;
    }

    function prequantize(objects, bbox, n) {
      var x0 = bbox[0],
          y0 = bbox[1],
          x1 = bbox[2],
          y1 = bbox[3],
          kx = x1 - x0 ? (n - 1) / (x1 - x0) : 1,
          ky = y1 - y0 ? (n - 1) / (y1 - y0) : 1;

      function quantizePoint(input) {
        return [Math.round((input[0] - x0) * kx), Math.round((input[1] - y0) * ky)];
      }

      function quantizePoints(input, m) {
        var i = -1,
            j = 0,
            n = input.length,
            output = new Array(n), // pessimistic
            pi,
            px,
            py,
            x,
            y;

        while (++i < n) {
          pi = input[i];
          x = Math.round((pi[0] - x0) * kx);
          y = Math.round((pi[1] - y0) * ky);
          if (x !== px || y !== py) output[j++] = [px = x, py = y]; // non-coincident points
        }

        output.length = j;
        while (j < m) j = output.push([output[0][0], output[0][1]]);
        return output;
      }

      function quantizeLine(input) {
        return quantizePoints(input, 2);
      }

      function quantizeRing(input) {
        return quantizePoints(input, 4);
      }

      function quantizePolygon(input) {
        return input.map(quantizeRing);
      }

      function quantizeGeometry(o) {
        if (o != null && quantizeGeometryType.hasOwnProperty(o.type)) quantizeGeometryType[o.type](o);
      }

      var quantizeGeometryType = {
        GeometryCollection: function(o) { o.geometries.forEach(quantizeGeometry); },
        Point: function(o) { o.coordinates = quantizePoint(o.coordinates); },
        MultiPoint: function(o) { o.coordinates = o.coordinates.map(quantizePoint); },
        LineString: function(o) { o.arcs = quantizeLine(o.arcs); },
        MultiLineString: function(o) { o.arcs = o.arcs.map(quantizeLine); },
        Polygon: function(o) { o.arcs = quantizePolygon(o.arcs); },
        MultiPolygon: function(o) { o.arcs = o.arcs.map(quantizePolygon); }
      };

      for (var key in objects) {
        quantizeGeometry(objects[key]);
      }

      return {
        scale: [1 / kx, 1 / ky],
        translate: [x0, y0]
      };
    }

    // Constructs the TopoJSON Topology for the specified hash of features.
    // Each object in the specified hash must be a GeoJSON object,
    // meaning FeatureCollection, a Feature or a geometry object.
    function topology(objects, quantization) {
      var bbox = bounds(objects = geometry(objects)),
          transform = quantization > 0 && bbox && prequantize(objects, bbox, quantization),
          topology = dedup(cut(extract(objects))),
          coordinates = topology.coordinates,
          indexByArc = hashmap(topology.arcs.length * 1.4, hashArc, equalArc);

      objects = topology.objects; // for garbage collection
      topology.bbox = bbox;
      topology.arcs = topology.arcs.map(function(arc, i) {
        indexByArc.set(arc, i);
        return coordinates.slice(arc[0], arc[1] + 1);
      });

      delete topology.coordinates;
      coordinates = null;

      function indexGeometry(geometry) {
        if (geometry && indexGeometryType.hasOwnProperty(geometry.type)) indexGeometryType[geometry.type](geometry);
      }

      var indexGeometryType = {
        GeometryCollection: function(o) { o.geometries.forEach(indexGeometry); },
        LineString: function(o) { o.arcs = indexArcs(o.arcs); },
        MultiLineString: function(o) { o.arcs = o.arcs.map(indexArcs); },
        Polygon: function(o) { o.arcs = o.arcs.map(indexArcs); },
        MultiPolygon: function(o) { o.arcs = o.arcs.map(indexMultiArcs); }
      };

      function indexArcs(arc) {
        var indexes = [];
        do {
          var index = indexByArc.get(arc);
          indexes.push(arc[0] < arc[1] ? index : ~index);
        } while (arc = arc.next);
        return indexes;
      }

      function indexMultiArcs(arcs) {
        return arcs.map(indexArcs);
      }

      for (var key in objects) {
        indexGeometry(objects[key]);
      }

      if (transform) {
        topology.transform = transform;
        topology.arcs = delta(topology.arcs);
      }

      return topology;
    }

    function hashArc(arc) {
      var i = arc[0], j = arc[1], t;
      if (j < i) t = i, i = j, j = t;
      return i + 31 * j;
    }

    function equalArc(arcA, arcB) {
      var ia = arcA[0], ja = arcA[1],
          ib = arcB[0], jb = arcB[1], t;
      if (ja < ia) t = ia, ia = ja, ja = t;
      if (jb < ib) t = ib, ib = jb, jb = t;
      return ia === ib && ja === jb;
    }

    function prune(topology) {
      var oldObjects = topology.objects,
          newObjects = {},
          oldArcs = topology.arcs,
          oldArcsLength = oldArcs.length,
          oldIndex = -1,
          newIndexByOldIndex = new Array(oldArcsLength),
          newArcsLength = 0,
          newArcs,
          newIndex = -1,
          key;

      function scanGeometry(input) {
        switch (input.type) {
          case "GeometryCollection": input.geometries.forEach(scanGeometry); break;
          case "LineString": scanArcs(input.arcs); break;
          case "MultiLineString": input.arcs.forEach(scanArcs); break;
          case "Polygon": input.arcs.forEach(scanArcs); break;
          case "MultiPolygon": input.arcs.forEach(scanMultiArcs); break;
        }
      }

      function scanArc(index) {
        if (index < 0) index = ~index;
        if (!newIndexByOldIndex[index]) newIndexByOldIndex[index] = 1, ++newArcsLength;
      }

      function scanArcs(arcs) {
        arcs.forEach(scanArc);
      }

      function scanMultiArcs(arcs) {
        arcs.forEach(scanArcs);
      }

      function reindexGeometry(input) {
        var output;
        switch (input.type) {
          case "GeometryCollection": output = {type: "GeometryCollection", geometries: input.geometries.map(reindexGeometry)}; break;
          case "LineString": output = {type: "LineString", arcs: reindexArcs(input.arcs)}; break;
          case "MultiLineString": output = {type: "MultiLineString", arcs: input.arcs.map(reindexArcs)}; break;
          case "Polygon": output = {type: "Polygon", arcs: input.arcs.map(reindexArcs)}; break;
          case "MultiPolygon": output = {type: "MultiPolygon", arcs: input.arcs.map(reindexMultiArcs)}; break;
          default: return input;
        }
        if (input.id != null) output.id = input.id;
        if (input.bbox != null) output.bbox = input.bbox;
        if (input.properties != null) output.properties = input.properties;
        return output;
      }

      function reindexArc(oldIndex) {
        return oldIndex < 0 ? ~newIndexByOldIndex[~oldIndex] : newIndexByOldIndex[oldIndex];
      }

      function reindexArcs(arcs) {
        return arcs.map(reindexArc);
      }

      function reindexMultiArcs(arcs) {
        return arcs.map(reindexArcs);
      }

      for (key in oldObjects) {
        scanGeometry(oldObjects[key]);
      }

      newArcs = new Array(newArcsLength);

      while (++oldIndex < oldArcsLength) {
        if (newIndexByOldIndex[oldIndex]) {
          newIndexByOldIndex[oldIndex] = ++newIndex;
          newArcs[newIndex] = oldArcs[oldIndex];
        }
      }

      for (key in oldObjects) {
        newObjects[key] = reindexGeometry(oldObjects[key]);
      }

      return {
        type: "Topology",
        bbox: topology.bbox,
        transform: topology.transform,
        objects: newObjects,
        arcs: newArcs
      };
    }

    function filter$1(topology, filter) {
      var oldObjects = topology.objects,
          newObjects = {},
          key;

      if (filter == null) filter = filterTrue;

      function filterGeometry(input) {
        var output, arcs;
        switch (input.type) {
          case "Polygon": {
            arcs = filterRings(input.arcs);
            output = arcs ? {type: "Polygon", arcs: arcs} : {type: null};
            break;
          }
          case "MultiPolygon": {
            arcs = input.arcs.map(filterRings).filter(filterIdentity);
            output = arcs.length ? {type: "MultiPolygon", arcs: arcs} : {type: null};
            break;
          }
          case "GeometryCollection": {
            arcs = input.geometries.map(filterGeometry).filter(filterNotNull);
            output = arcs.length ? {type: "GeometryCollection", geometries: arcs} : {type: null};
            break;
          }
          default: return input;
        }
        if (input.id != null) output.id = input.id;
        if (input.bbox != null) output.bbox = input.bbox;
        if (input.properties != null) output.properties = input.properties;
        return output;
      }

      function filterRings(arcs) {
        return arcs.length && filterExteriorRing(arcs[0]) // if the exterior is small, ignore any holes
            ? [arcs[0]].concat(arcs.slice(1).filter(filterInteriorRing))
            : null;
      }

      function filterExteriorRing(ring) {
        return filter(ring, false);
      }

      function filterInteriorRing(ring) {
        return filter(ring, true);
      }

      for (key in oldObjects) {
        newObjects[key] = filterGeometry(oldObjects[key]);
      }

      return prune({
        type: "Topology",
        bbox: topology.bbox,
        transform: topology.transform,
        objects: newObjects,
        arcs: topology.arcs
      });
    }

    function filterTrue() {
      return true;
    }

    function filterIdentity(x) {
      return x;
    }

    function filterNotNull(geometry) {
      return geometry.type != null;
    }

    function filterAttached(topology) {
      var ownerByArc = new Array(topology.arcs.length), // arc index -> index of unique associated ring, or -1 if used by multiple rings
          ownerIndex = 0,
          key;

      function testGeometry(o) {
        switch (o.type) {
          case "GeometryCollection": o.geometries.forEach(testGeometry); break;
          case "Polygon": testArcs(o.arcs); break;
          case "MultiPolygon": o.arcs.forEach(testArcs); break;
        }
      }

      function testArcs(arcs) {
        for (var i = 0, n = arcs.length; i < n; ++i, ++ownerIndex) {
          for (var ring = arcs[i], j = 0, m = ring.length; j < m; ++j) {
            var arc = ring[j];
            if (arc < 0) arc = ~arc;
            var owner = ownerByArc[arc];
            if (owner == null) ownerByArc[arc] = ownerIndex;
            else if (owner !== ownerIndex) ownerByArc[arc] = -1;
          }
        }
      }

      for (key in topology.objects) {
        testGeometry(topology.objects[key]);
      }

      return function(ring) {
        for (var j = 0, m = ring.length, arc; j < m; ++j) {
          if (ownerByArc[(arc = ring[j]) < 0 ? ~arc : arc] === -1) {
            return true;
          }
        }
        return false;
      };
    }

    function planarTriangleArea(triangle) {
      var a = triangle[0], b = triangle[1], c = triangle[2];
      return Math.abs((a[0] - c[0]) * (b[1] - a[1]) - (a[0] - b[0]) * (c[1] - a[1])) / 2;
    }

    function planarRingArea$1(ring) {
      var i = -1, n = ring.length, a, b = ring[n - 1], area = 0;
      while (++i < n) a = b, b = ring[i], area += a[0] * b[1] - a[1] * b[0];
      return Math.abs(area) / 2;
    }

    function filterWeight(topology, minWeight, weight) {
      minWeight = minWeight == null ? Number.MIN_VALUE : +minWeight;

      if (weight == null) weight = planarRingArea$1;

      return function(ring, interior) {
        return weight(feature(topology, {type: "Polygon", arcs: [ring]}).geometry.coordinates[0], interior) >= minWeight;
      };
    }

    function filterAttachedWeight(topology, minWeight, weight) {
      var a = filterAttached(topology),
          w = filterWeight(topology, minWeight, weight);
      return function(ring, interior) {
        return a(ring, interior) || w(ring, interior);
      };
    }

    function compare(a, b) {
      return a[1][2] - b[1][2];
    }

    function newHeap() {
      var heap = {},
          array = [],
          size = 0;

      heap.push = function(object) {
        up(array[object._ = size] = object, size++);
        return size;
      };

      heap.pop = function() {
        if (size <= 0) return;
        var removed = array[0], object;
        if (--size > 0) object = array[size], down(array[object._ = 0] = object, 0);
        return removed;
      };

      heap.remove = function(removed) {
        var i = removed._, object;
        if (array[i] !== removed) return; // invalid request
        if (i !== --size) object = array[size], (compare(object, removed) < 0 ? up : down)(array[object._ = i] = object, i);
        return i;
      };

      function up(object, i) {
        while (i > 0) {
          var j = ((i + 1) >> 1) - 1,
              parent = array[j];
          if (compare(object, parent) >= 0) break;
          array[parent._ = i] = parent;
          array[object._ = i = j] = object;
        }
      }

      function down(object, i) {
        while (true) {
          var r = (i + 1) << 1,
              l = r - 1,
              j = i,
              child = array[j];
          if (l < size && compare(array[l], child) < 0) child = array[j = l];
          if (r < size && compare(array[r], child) < 0) child = array[j = r];
          if (j === i) break;
          array[child._ = i] = child;
          array[object._ = i = j] = object;
        }
      }

      return heap;
    }

    function copy$1(point) {
      return [point[0], point[1], 0];
    }

    function presimplify(topology, weight) {
      var point = topology.transform ? transform(topology.transform) : copy$1,
          heap = newHeap();

      if (weight == null) weight = planarTriangleArea;

      var arcs = topology.arcs.map(function(arc) {
        var triangles = [],
            maxWeight = 0,
            triangle,
            i,
            n;

        arc = arc.map(point);

        for (i = 1, n = arc.length - 1; i < n; ++i) {
          triangle = [arc[i - 1], arc[i], arc[i + 1]];
          triangle[1][2] = weight(triangle);
          triangles.push(triangle);
          heap.push(triangle);
        }

        // Always keep the arc endpoints!
        arc[0][2] = arc[n][2] = Infinity;

        for (i = 0, n = triangles.length; i < n; ++i) {
          triangle = triangles[i];
          triangle.previous = triangles[i - 1];
          triangle.next = triangles[i + 1];
        }

        while (triangle = heap.pop()) {
          var previous = triangle.previous,
              next = triangle.next;

          // If the weight of the current point is less than that of the previous
          // point to be eliminated, use the latter’s weight instead. This ensures
          // that the current point cannot be eliminated without eliminating
          // previously- eliminated points.
          if (triangle[1][2] < maxWeight) triangle[1][2] = maxWeight;
          else maxWeight = triangle[1][2];

          if (previous) {
            previous.next = next;
            previous[2] = triangle[2];
            update(previous);
          }

          if (next) {
            next.previous = previous;
            next[0] = triangle[0];
            update(next);
          }
        }

        return arc;
      });

      function update(triangle) {
        heap.remove(triangle);
        triangle[1][2] = weight(triangle);
        heap.push(triangle);
      }

      return {
        type: "Topology",
        bbox: topology.bbox,
        objects: topology.objects,
        arcs: arcs
      };
    }

    function quantile(topology, p) {
      var array = [];

      topology.arcs.forEach(function(arc) {
        arc.forEach(function(point) {
          if (isFinite(point[2])) { // Ignore endpoints, whose weight is Infinity.
            array.push(point[2]);
          }
        });
      });

      return array.length && quantile$1(array.sort(descending$1), p);
    }

    function quantile$1(array, p) {
      if (!(n = array.length)) return;
      if ((p = +p) <= 0 || n < 2) return array[0];
      if (p >= 1) return array[n - 1];
      var n,
          h = (n - 1) * p,
          i = Math.floor(h),
          a = array[i],
          b = array[i + 1];
      return a + (b - a) * (h - i);
    }

    function descending$1(a, b) {
      return b - a;
    }

    function simplify(topology, minWeight) {
      minWeight = minWeight == null ? Number.MIN_VALUE : +minWeight;

      // Remove points whose weight is less than the minimum weight.
      var arcs = topology.arcs.map(function(input) {
        var i = -1,
            j = 0,
            n = input.length,
            output = new Array(n), // pessimistic
            point;

        while (++i < n) {
          if ((point = input[i])[2] >= minWeight) {
            output[j++] = [point[0], point[1]];
          }
        }

        output.length = j;
        return output;
      });

      return {
        type: "Topology",
        transform: topology.transform,
        bbox: topology.bbox,
        objects: topology.objects,
        arcs: arcs
      };
    }

    var pi = Math.PI,
        tau = 2 * pi,
        quarterPi = pi / 4,
        radians = pi / 180,
        abs = Math.abs,
        atan2 = Math.atan2,
        cos = Math.cos,
        sin = Math.sin;

    function halfArea(ring, closed) {
      var i = 0,
          n = ring.length,
          sum = 0,
          point = ring[closed ? i++ : n - 1],
          lambda0, lambda1 = point[0] * radians,
          phi1 = (point[1] * radians) / 2 + quarterPi,
          cosPhi0, cosPhi1 = cos(phi1),
          sinPhi0, sinPhi1 = sin(phi1);

      for (; i < n; ++i) {
        point = ring[i];
        lambda0 = lambda1, lambda1 = point[0] * radians;
        phi1 = (point[1] * radians) / 2 + quarterPi;
        cosPhi0 = cosPhi1, cosPhi1 = cos(phi1);
        sinPhi0 = sinPhi1, sinPhi1 = sin(phi1);

        // Spherical excess E for a spherical triangle with vertices: south pole,
        // previous point, current point.  Uses a formula derived from Cagnoli’s
        // theorem.  See Todhunter, Spherical Trig. (1871), Sec. 103, Eq. (2).
        // See https://github.com/d3/d3-geo/blob/master/README.md#geoArea
        var dLambda = lambda1 - lambda0,
            sdLambda = dLambda >= 0 ? 1 : -1,
            adLambda = sdLambda * dLambda,
            k = sinPhi0 * sinPhi1,
            u = cosPhi0 * cosPhi1 + k * cos(adLambda),
            v = k * sdLambda * sin(adLambda);
        sum += atan2(v, u);
      }

      return sum;
    }

    function sphericalRingArea(ring, interior) {
      var sum = halfArea(ring, true);
      if (interior) sum *= -1;
      return (sum < 0 ? tau + sum : sum) * 2;
    }

    function sphericalTriangleArea(t) {
      return abs(halfArea(t, false)) * 2;
    }

    var topojson = /*#__PURE__*/Object.freeze({
        __proto__: null,
        bbox: bbox,
        feature: feature,
        mesh: mesh,
        meshArcs: meshArcs,
        merge: merge$1,
        mergeArcs: mergeArcs,
        neighbors: neighbors,
        quantize: quantize,
        transform: transform,
        untransform: untransform,
        topology: topology,
        filter: filter$1,
        filterAttached: filterAttached,
        filterAttachedWeight: filterAttachedWeight,
        filterWeight: filterWeight,
        planarRingArea: planarRingArea$1,
        planarTriangleArea: planarTriangleArea,
        presimplify: presimplify,
        quantile: quantile,
        simplify: simplify,
        sphericalRingArea: sphericalRingArea,
        sphericalTriangleArea: sphericalTriangleArea
    });

    function responseJson(response) {
      if (!response.ok) throw new Error(response.status + " " + response.statusText);
      if (response.status === 204 || response.status === 205) return;
      return response.json();
    }

    function json(input, init) {
      return fetch(input, init).then(responseJson);
    }

    var epsilon$1 = 1e-6;
    var epsilon2 = 1e-12;
    var pi$1 = Math.PI;
    var halfPi = pi$1 / 2;
    var quarterPi$1 = pi$1 / 4;
    var tau$1 = pi$1 * 2;

    var degrees$1 = 180 / pi$1;
    var radians$1 = pi$1 / 180;

    var abs$1 = Math.abs;
    var atan = Math.atan;
    var atan2$1 = Math.atan2;
    var cos$1 = Math.cos;
    var exp = Math.exp;
    var log = Math.log;
    var sin$1 = Math.sin;
    var sign = Math.sign || function(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; };
    var sqrt = Math.sqrt;
    var tan = Math.tan;

    function acos(x) {
      return x > 1 ? 0 : x < -1 ? pi$1 : Math.acos(x);
    }

    function asin(x) {
      return x > 1 ? halfPi : x < -1 ? -halfPi : Math.asin(x);
    }

    function noop$2() {}

    function streamGeometry(geometry, stream) {
      if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
        streamGeometryType[geometry.type](geometry, stream);
      }
    }

    var streamObjectType = {
      Feature: function(object, stream) {
        streamGeometry(object.geometry, stream);
      },
      FeatureCollection: function(object, stream) {
        var features = object.features, i = -1, n = features.length;
        while (++i < n) streamGeometry(features[i].geometry, stream);
      }
    };

    var streamGeometryType = {
      Sphere: function(object, stream) {
        stream.sphere();
      },
      Point: function(object, stream) {
        object = object.coordinates;
        stream.point(object[0], object[1], object[2]);
      },
      MultiPoint: function(object, stream) {
        var coordinates = object.coordinates, i = -1, n = coordinates.length;
        while (++i < n) object = coordinates[i], stream.point(object[0], object[1], object[2]);
      },
      LineString: function(object, stream) {
        streamLine(object.coordinates, stream, 0);
      },
      MultiLineString: function(object, stream) {
        var coordinates = object.coordinates, i = -1, n = coordinates.length;
        while (++i < n) streamLine(coordinates[i], stream, 0);
      },
      Polygon: function(object, stream) {
        streamPolygon(object.coordinates, stream);
      },
      MultiPolygon: function(object, stream) {
        var coordinates = object.coordinates, i = -1, n = coordinates.length;
        while (++i < n) streamPolygon(coordinates[i], stream);
      },
      GeometryCollection: function(object, stream) {
        var geometries = object.geometries, i = -1, n = geometries.length;
        while (++i < n) streamGeometry(geometries[i], stream);
      }
    };

    function streamLine(coordinates, stream, closed) {
      var i = -1, n = coordinates.length - closed, coordinate;
      stream.lineStart();
      while (++i < n) coordinate = coordinates[i], stream.point(coordinate[0], coordinate[1], coordinate[2]);
      stream.lineEnd();
    }

    function streamPolygon(coordinates, stream) {
      var i = -1, n = coordinates.length;
      stream.polygonStart();
      while (++i < n) streamLine(coordinates[i], stream, 1);
      stream.polygonEnd();
    }

    function geoStream(object, stream) {
      if (object && streamObjectType.hasOwnProperty(object.type)) {
        streamObjectType[object.type](object, stream);
      } else {
        streamGeometry(object, stream);
      }
    }

    function spherical(cartesian) {
      return [atan2$1(cartesian[1], cartesian[0]), asin(cartesian[2])];
    }

    function cartesian(spherical) {
      var lambda = spherical[0], phi = spherical[1], cosPhi = cos$1(phi);
      return [cosPhi * cos$1(lambda), cosPhi * sin$1(lambda), sin$1(phi)];
    }

    function cartesianDot(a, b) {
      return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }

    function cartesianCross(a, b) {
      return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    }

    // TODO return a
    function cartesianAddInPlace(a, b) {
      a[0] += b[0], a[1] += b[1], a[2] += b[2];
    }

    function cartesianScale(vector, k) {
      return [vector[0] * k, vector[1] * k, vector[2] * k];
    }

    // TODO return d
    function cartesianNormalizeInPlace(d) {
      var l = sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
      d[0] /= l, d[1] /= l, d[2] /= l;
    }

    function compose(a, b) {

      function compose(x, y) {
        return x = a(x, y), b(x[0], x[1]);
      }

      if (a.invert && b.invert) compose.invert = function(x, y) {
        return x = b.invert(x, y), x && a.invert(x[0], x[1]);
      };

      return compose;
    }

    function rotationIdentity(lambda, phi) {
      return [abs$1(lambda) > pi$1 ? lambda + Math.round(-lambda / tau$1) * tau$1 : lambda, phi];
    }

    rotationIdentity.invert = rotationIdentity;

    function rotateRadians(deltaLambda, deltaPhi, deltaGamma) {
      return (deltaLambda %= tau$1) ? (deltaPhi || deltaGamma ? compose(rotationLambda(deltaLambda), rotationPhiGamma(deltaPhi, deltaGamma))
        : rotationLambda(deltaLambda))
        : (deltaPhi || deltaGamma ? rotationPhiGamma(deltaPhi, deltaGamma)
        : rotationIdentity);
    }

    function forwardRotationLambda(deltaLambda) {
      return function(lambda, phi) {
        return lambda += deltaLambda, [lambda > pi$1 ? lambda - tau$1 : lambda < -pi$1 ? lambda + tau$1 : lambda, phi];
      };
    }

    function rotationLambda(deltaLambda) {
      var rotation = forwardRotationLambda(deltaLambda);
      rotation.invert = forwardRotationLambda(-deltaLambda);
      return rotation;
    }

    function rotationPhiGamma(deltaPhi, deltaGamma) {
      var cosDeltaPhi = cos$1(deltaPhi),
          sinDeltaPhi = sin$1(deltaPhi),
          cosDeltaGamma = cos$1(deltaGamma),
          sinDeltaGamma = sin$1(deltaGamma);

      function rotation(lambda, phi) {
        var cosPhi = cos$1(phi),
            x = cos$1(lambda) * cosPhi,
            y = sin$1(lambda) * cosPhi,
            z = sin$1(phi),
            k = z * cosDeltaPhi + x * sinDeltaPhi;
        return [
          atan2$1(y * cosDeltaGamma - k * sinDeltaGamma, x * cosDeltaPhi - z * sinDeltaPhi),
          asin(k * cosDeltaGamma + y * sinDeltaGamma)
        ];
      }

      rotation.invert = function(lambda, phi) {
        var cosPhi = cos$1(phi),
            x = cos$1(lambda) * cosPhi,
            y = sin$1(lambda) * cosPhi,
            z = sin$1(phi),
            k = z * cosDeltaGamma - y * sinDeltaGamma;
        return [
          atan2$1(y * cosDeltaGamma + z * sinDeltaGamma, x * cosDeltaPhi + k * sinDeltaPhi),
          asin(k * cosDeltaPhi - x * sinDeltaPhi)
        ];
      };

      return rotation;
    }

    function rotation(rotate) {
      rotate = rotateRadians(rotate[0] * radians$1, rotate[1] * radians$1, rotate.length > 2 ? rotate[2] * radians$1 : 0);

      function forward(coordinates) {
        coordinates = rotate(coordinates[0] * radians$1, coordinates[1] * radians$1);
        return coordinates[0] *= degrees$1, coordinates[1] *= degrees$1, coordinates;
      }

      forward.invert = function(coordinates) {
        coordinates = rotate.invert(coordinates[0] * radians$1, coordinates[1] * radians$1);
        return coordinates[0] *= degrees$1, coordinates[1] *= degrees$1, coordinates;
      };

      return forward;
    }

    // Generates a circle centered at [0°, 0°], with a given radius and precision.
    function circleStream(stream, radius, delta, direction, t0, t1) {
      if (!delta) return;
      var cosRadius = cos$1(radius),
          sinRadius = sin$1(radius),
          step = direction * delta;
      if (t0 == null) {
        t0 = radius + direction * tau$1;
        t1 = radius - step / 2;
      } else {
        t0 = circleRadius(cosRadius, t0);
        t1 = circleRadius(cosRadius, t1);
        if (direction > 0 ? t0 < t1 : t0 > t1) t0 += direction * tau$1;
      }
      for (var point, t = t0; direction > 0 ? t > t1 : t < t1; t -= step) {
        point = spherical([cosRadius, -sinRadius * cos$1(t), -sinRadius * sin$1(t)]);
        stream.point(point[0], point[1]);
      }
    }

    // Returns the signed angle of a cartesian point relative to [cosRadius, 0, 0].
    function circleRadius(cosRadius, point) {
      point = cartesian(point), point[0] -= cosRadius;
      cartesianNormalizeInPlace(point);
      var radius = acos(-point[1]);
      return ((-point[2] < 0 ? -radius : radius) + tau$1 - epsilon$1) % tau$1;
    }

    function clipBuffer() {
      var lines = [],
          line;
      return {
        point: function(x, y, m) {
          line.push([x, y, m]);
        },
        lineStart: function() {
          lines.push(line = []);
        },
        lineEnd: noop$2,
        rejoin: function() {
          if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
        },
        result: function() {
          var result = lines;
          lines = [];
          line = null;
          return result;
        }
      };
    }

    function pointEqual(a, b) {
      return abs$1(a[0] - b[0]) < epsilon$1 && abs$1(a[1] - b[1]) < epsilon$1;
    }

    function Intersection(point, points, other, entry) {
      this.x = point;
      this.z = points;
      this.o = other; // another intersection
      this.e = entry; // is an entry?
      this.v = false; // visited
      this.n = this.p = null; // next & previous
    }

    // A generalized polygon clipping algorithm: given a polygon that has been cut
    // into its visible line segments, and rejoins the segments by interpolating
    // along the clip edge.
    function clipRejoin(segments, compareIntersection, startInside, interpolate, stream) {
      var subject = [],
          clip = [],
          i,
          n;

      segments.forEach(function(segment) {
        if ((n = segment.length - 1) <= 0) return;
        var n, p0 = segment[0], p1 = segment[n], x;

        if (pointEqual(p0, p1)) {
          if (!p0[2] && !p1[2]) {
            stream.lineStart();
            for (i = 0; i < n; ++i) stream.point((p0 = segment[i])[0], p0[1]);
            stream.lineEnd();
            return;
          }
          // handle degenerate cases by moving the point
          p1[0] += 2 * epsilon$1;
        }

        subject.push(x = new Intersection(p0, segment, null, true));
        clip.push(x.o = new Intersection(p0, null, x, false));
        subject.push(x = new Intersection(p1, segment, null, false));
        clip.push(x.o = new Intersection(p1, null, x, true));
      });

      if (!subject.length) return;

      clip.sort(compareIntersection);
      link(subject);
      link(clip);

      for (i = 0, n = clip.length; i < n; ++i) {
        clip[i].e = startInside = !startInside;
      }

      var start = subject[0],
          points,
          point;

      while (1) {
        // Find first unvisited intersection.
        var current = start,
            isSubject = true;
        while (current.v) if ((current = current.n) === start) return;
        points = current.z;
        stream.lineStart();
        do {
          current.v = current.o.v = true;
          if (current.e) {
            if (isSubject) {
              for (i = 0, n = points.length; i < n; ++i) stream.point((point = points[i])[0], point[1]);
            } else {
              interpolate(current.x, current.n.x, 1, stream);
            }
            current = current.n;
          } else {
            if (isSubject) {
              points = current.p.z;
              for (i = points.length - 1; i >= 0; --i) stream.point((point = points[i])[0], point[1]);
            } else {
              interpolate(current.x, current.p.x, -1, stream);
            }
            current = current.p;
          }
          current = current.o;
          points = current.z;
          isSubject = !isSubject;
        } while (!current.v);
        stream.lineEnd();
      }
    }

    function link(array) {
      if (!(n = array.length)) return;
      var n,
          i = 0,
          a = array[0],
          b;
      while (++i < n) {
        a.n = b = array[i];
        b.p = a;
        a = b;
      }
      a.n = b = array[0];
      b.p = a;
    }

    function longitude(point) {
      if (abs$1(point[0]) <= pi$1)
        return point[0];
      else
        return sign(point[0]) * ((abs$1(point[0]) + pi$1) % tau$1 - pi$1);
    }

    function polygonContains(polygon, point) {
      var lambda = longitude(point),
          phi = point[1],
          sinPhi = sin$1(phi),
          normal = [sin$1(lambda), -cos$1(lambda), 0],
          angle = 0,
          winding = 0;

      var sum = new Adder();

      if (sinPhi === 1) phi = halfPi + epsilon$1;
      else if (sinPhi === -1) phi = -halfPi - epsilon$1;

      for (var i = 0, n = polygon.length; i < n; ++i) {
        if (!(m = (ring = polygon[i]).length)) continue;
        var ring,
            m,
            point0 = ring[m - 1],
            lambda0 = longitude(point0),
            phi0 = point0[1] / 2 + quarterPi$1,
            sinPhi0 = sin$1(phi0),
            cosPhi0 = cos$1(phi0);

        for (var j = 0; j < m; ++j, lambda0 = lambda1, sinPhi0 = sinPhi1, cosPhi0 = cosPhi1, point0 = point1) {
          var point1 = ring[j],
              lambda1 = longitude(point1),
              phi1 = point1[1] / 2 + quarterPi$1,
              sinPhi1 = sin$1(phi1),
              cosPhi1 = cos$1(phi1),
              delta = lambda1 - lambda0,
              sign = delta >= 0 ? 1 : -1,
              absDelta = sign * delta,
              antimeridian = absDelta > pi$1,
              k = sinPhi0 * sinPhi1;

          sum.add(atan2$1(k * sign * sin$1(absDelta), cosPhi0 * cosPhi1 + k * cos$1(absDelta)));
          angle += antimeridian ? delta + sign * tau$1 : delta;

          // Are the longitudes either side of the point’s meridian (lambda),
          // and are the latitudes smaller than the parallel (phi)?
          if (antimeridian ^ lambda0 >= lambda ^ lambda1 >= lambda) {
            var arc = cartesianCross(cartesian(point0), cartesian(point1));
            cartesianNormalizeInPlace(arc);
            var intersection = cartesianCross(normal, arc);
            cartesianNormalizeInPlace(intersection);
            var phiArc = (antimeridian ^ delta >= 0 ? -1 : 1) * asin(intersection[2]);
            if (phi > phiArc || phi === phiArc && (arc[0] || arc[1])) {
              winding += antimeridian ^ delta >= 0 ? 1 : -1;
            }
          }
        }
      }

      // First, determine whether the South pole is inside or outside:
      //
      // It is inside if:
      // * the polygon winds around it in a clockwise direction.
      // * the polygon does not (cumulatively) wind around it, but has a negative
      //   (counter-clockwise) area.
      //
      // Second, count the (signed) number of times a segment crosses a lambda
      // from the point to the South pole.  If it is zero, then the point is the
      // same side as the South pole.

      return (angle < -epsilon$1 || angle < epsilon$1 && sum < -epsilon2) ^ (winding & 1);
    }

    function clip(pointVisible, clipLine, interpolate, start) {
      return function(sink) {
        var line = clipLine(sink),
            ringBuffer = clipBuffer(),
            ringSink = clipLine(ringBuffer),
            polygonStarted = false,
            polygon,
            segments,
            ring;

        var clip = {
          point: point,
          lineStart: lineStart,
          lineEnd: lineEnd,
          polygonStart: function() {
            clip.point = pointRing;
            clip.lineStart = ringStart;
            clip.lineEnd = ringEnd;
            segments = [];
            polygon = [];
          },
          polygonEnd: function() {
            clip.point = point;
            clip.lineStart = lineStart;
            clip.lineEnd = lineEnd;
            segments = merge(segments);
            var startInside = polygonContains(polygon, start);
            if (segments.length) {
              if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
              clipRejoin(segments, compareIntersection, startInside, interpolate, sink);
            } else if (startInside) {
              if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
              sink.lineStart();
              interpolate(null, null, 1, sink);
              sink.lineEnd();
            }
            if (polygonStarted) sink.polygonEnd(), polygonStarted = false;
            segments = polygon = null;
          },
          sphere: function() {
            sink.polygonStart();
            sink.lineStart();
            interpolate(null, null, 1, sink);
            sink.lineEnd();
            sink.polygonEnd();
          }
        };

        function point(lambda, phi) {
          if (pointVisible(lambda, phi)) sink.point(lambda, phi);
        }

        function pointLine(lambda, phi) {
          line.point(lambda, phi);
        }

        function lineStart() {
          clip.point = pointLine;
          line.lineStart();
        }

        function lineEnd() {
          clip.point = point;
          line.lineEnd();
        }

        function pointRing(lambda, phi) {
          ring.push([lambda, phi]);
          ringSink.point(lambda, phi);
        }

        function ringStart() {
          ringSink.lineStart();
          ring = [];
        }

        function ringEnd() {
          pointRing(ring[0][0], ring[0][1]);
          ringSink.lineEnd();

          var clean = ringSink.clean(),
              ringSegments = ringBuffer.result(),
              i, n = ringSegments.length, m,
              segment,
              point;

          ring.pop();
          polygon.push(ring);
          ring = null;

          if (!n) return;

          // No intersections.
          if (clean & 1) {
            segment = ringSegments[0];
            if ((m = segment.length - 1) > 0) {
              if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
              sink.lineStart();
              for (i = 0; i < m; ++i) sink.point((point = segment[i])[0], point[1]);
              sink.lineEnd();
            }
            return;
          }

          // Rejoin connected segments.
          // TODO reuse ringBuffer.rejoin()?
          if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));

          segments.push(ringSegments.filter(validSegment));
        }

        return clip;
      };
    }

    function validSegment(segment) {
      return segment.length > 1;
    }

    // Intersections are sorted along the clip edge. For both antimeridian cutting
    // and circle clipping, the same comparison is used.
    function compareIntersection(a, b) {
      return ((a = a.x)[0] < 0 ? a[1] - halfPi - epsilon$1 : halfPi - a[1])
           - ((b = b.x)[0] < 0 ? b[1] - halfPi - epsilon$1 : halfPi - b[1]);
    }

    var clipAntimeridian = clip(
      function() { return true; },
      clipAntimeridianLine,
      clipAntimeridianInterpolate,
      [-pi$1, -halfPi]
    );

    // Takes a line and cuts into visible segments. Return values: 0 - there were
    // intersections or the line was empty; 1 - no intersections; 2 - there were
    // intersections, and the first and last segments should be rejoined.
    function clipAntimeridianLine(stream) {
      var lambda0 = NaN,
          phi0 = NaN,
          sign0 = NaN,
          clean; // no intersections

      return {
        lineStart: function() {
          stream.lineStart();
          clean = 1;
        },
        point: function(lambda1, phi1) {
          var sign1 = lambda1 > 0 ? pi$1 : -pi$1,
              delta = abs$1(lambda1 - lambda0);
          if (abs$1(delta - pi$1) < epsilon$1) { // line crosses a pole
            stream.point(lambda0, phi0 = (phi0 + phi1) / 2 > 0 ? halfPi : -halfPi);
            stream.point(sign0, phi0);
            stream.lineEnd();
            stream.lineStart();
            stream.point(sign1, phi0);
            stream.point(lambda1, phi0);
            clean = 0;
          } else if (sign0 !== sign1 && delta >= pi$1) { // line crosses antimeridian
            if (abs$1(lambda0 - sign0) < epsilon$1) lambda0 -= sign0 * epsilon$1; // handle degeneracies
            if (abs$1(lambda1 - sign1) < epsilon$1) lambda1 -= sign1 * epsilon$1;
            phi0 = clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1);
            stream.point(sign0, phi0);
            stream.lineEnd();
            stream.lineStart();
            stream.point(sign1, phi0);
            clean = 0;
          }
          stream.point(lambda0 = lambda1, phi0 = phi1);
          sign0 = sign1;
        },
        lineEnd: function() {
          stream.lineEnd();
          lambda0 = phi0 = NaN;
        },
        clean: function() {
          return 2 - clean; // if intersections, rejoin first and last segments
        }
      };
    }

    function clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1) {
      var cosPhi0,
          cosPhi1,
          sinLambda0Lambda1 = sin$1(lambda0 - lambda1);
      return abs$1(sinLambda0Lambda1) > epsilon$1
          ? atan((sin$1(phi0) * (cosPhi1 = cos$1(phi1)) * sin$1(lambda1)
              - sin$1(phi1) * (cosPhi0 = cos$1(phi0)) * sin$1(lambda0))
              / (cosPhi0 * cosPhi1 * sinLambda0Lambda1))
          : (phi0 + phi1) / 2;
    }

    function clipAntimeridianInterpolate(from, to, direction, stream) {
      var phi;
      if (from == null) {
        phi = direction * halfPi;
        stream.point(-pi$1, phi);
        stream.point(0, phi);
        stream.point(pi$1, phi);
        stream.point(pi$1, 0);
        stream.point(pi$1, -phi);
        stream.point(0, -phi);
        stream.point(-pi$1, -phi);
        stream.point(-pi$1, 0);
        stream.point(-pi$1, phi);
      } else if (abs$1(from[0] - to[0]) > epsilon$1) {
        var lambda = from[0] < to[0] ? pi$1 : -pi$1;
        phi = direction * lambda / 2;
        stream.point(-lambda, phi);
        stream.point(0, phi);
        stream.point(lambda, phi);
      } else {
        stream.point(to[0], to[1]);
      }
    }

    function clipCircle(radius) {
      var cr = cos$1(radius),
          delta = 6 * radians$1,
          smallRadius = cr > 0,
          notHemisphere = abs$1(cr) > epsilon$1; // TODO optimise for this common case

      function interpolate(from, to, direction, stream) {
        circleStream(stream, radius, delta, direction, from, to);
      }

      function visible(lambda, phi) {
        return cos$1(lambda) * cos$1(phi) > cr;
      }

      // Takes a line and cuts into visible segments. Return values used for polygon
      // clipping: 0 - there were intersections or the line was empty; 1 - no
      // intersections 2 - there were intersections, and the first and last segments
      // should be rejoined.
      function clipLine(stream) {
        var point0, // previous point
            c0, // code for previous point
            v0, // visibility of previous point
            v00, // visibility of first point
            clean; // no intersections
        return {
          lineStart: function() {
            v00 = v0 = false;
            clean = 1;
          },
          point: function(lambda, phi) {
            var point1 = [lambda, phi],
                point2,
                v = visible(lambda, phi),
                c = smallRadius
                  ? v ? 0 : code(lambda, phi)
                  : v ? code(lambda + (lambda < 0 ? pi$1 : -pi$1), phi) : 0;
            if (!point0 && (v00 = v0 = v)) stream.lineStart();
            if (v !== v0) {
              point2 = intersect(point0, point1);
              if (!point2 || pointEqual(point0, point2) || pointEqual(point1, point2))
                point1[2] = 1;
            }
            if (v !== v0) {
              clean = 0;
              if (v) {
                // outside going in
                stream.lineStart();
                point2 = intersect(point1, point0);
                stream.point(point2[0], point2[1]);
              } else {
                // inside going out
                point2 = intersect(point0, point1);
                stream.point(point2[0], point2[1], 2);
                stream.lineEnd();
              }
              point0 = point2;
            } else if (notHemisphere && point0 && smallRadius ^ v) {
              var t;
              // If the codes for two points are different, or are both zero,
              // and there this segment intersects with the small circle.
              if (!(c & c0) && (t = intersect(point1, point0, true))) {
                clean = 0;
                if (smallRadius) {
                  stream.lineStart();
                  stream.point(t[0][0], t[0][1]);
                  stream.point(t[1][0], t[1][1]);
                  stream.lineEnd();
                } else {
                  stream.point(t[1][0], t[1][1]);
                  stream.lineEnd();
                  stream.lineStart();
                  stream.point(t[0][0], t[0][1], 3);
                }
              }
            }
            if (v && (!point0 || !pointEqual(point0, point1))) {
              stream.point(point1[0], point1[1]);
            }
            point0 = point1, v0 = v, c0 = c;
          },
          lineEnd: function() {
            if (v0) stream.lineEnd();
            point0 = null;
          },
          // Rejoin first and last segments if there were intersections and the first
          // and last points were visible.
          clean: function() {
            return clean | ((v00 && v0) << 1);
          }
        };
      }

      // Intersects the great circle between a and b with the clip circle.
      function intersect(a, b, two) {
        var pa = cartesian(a),
            pb = cartesian(b);

        // We have two planes, n1.p = d1 and n2.p = d2.
        // Find intersection line p(t) = c1 n1 + c2 n2 + t (n1 ⨯ n2).
        var n1 = [1, 0, 0], // normal
            n2 = cartesianCross(pa, pb),
            n2n2 = cartesianDot(n2, n2),
            n1n2 = n2[0], // cartesianDot(n1, n2),
            determinant = n2n2 - n1n2 * n1n2;

        // Two polar points.
        if (!determinant) return !two && a;

        var c1 =  cr * n2n2 / determinant,
            c2 = -cr * n1n2 / determinant,
            n1xn2 = cartesianCross(n1, n2),
            A = cartesianScale(n1, c1),
            B = cartesianScale(n2, c2);
        cartesianAddInPlace(A, B);

        // Solve |p(t)|^2 = 1.
        var u = n1xn2,
            w = cartesianDot(A, u),
            uu = cartesianDot(u, u),
            t2 = w * w - uu * (cartesianDot(A, A) - 1);

        if (t2 < 0) return;

        var t = sqrt(t2),
            q = cartesianScale(u, (-w - t) / uu);
        cartesianAddInPlace(q, A);
        q = spherical(q);

        if (!two) return q;

        // Two intersection points.
        var lambda0 = a[0],
            lambda1 = b[0],
            phi0 = a[1],
            phi1 = b[1],
            z;

        if (lambda1 < lambda0) z = lambda0, lambda0 = lambda1, lambda1 = z;

        var delta = lambda1 - lambda0,
            polar = abs$1(delta - pi$1) < epsilon$1,
            meridian = polar || delta < epsilon$1;

        if (!polar && phi1 < phi0) z = phi0, phi0 = phi1, phi1 = z;

        // Check that the first point is between a and b.
        if (meridian
            ? polar
              ? phi0 + phi1 > 0 ^ q[1] < (abs$1(q[0] - lambda0) < epsilon$1 ? phi0 : phi1)
              : phi0 <= q[1] && q[1] <= phi1
            : delta > pi$1 ^ (lambda0 <= q[0] && q[0] <= lambda1)) {
          var q1 = cartesianScale(u, (-w + t) / uu);
          cartesianAddInPlace(q1, A);
          return [q, spherical(q1)];
        }
      }

      // Generates a 4-bit vector representing the location of a point relative to
      // the small circle's bounding box.
      function code(lambda, phi) {
        var r = smallRadius ? radius : pi$1 - radius,
            code = 0;
        if (lambda < -r) code |= 1; // left
        else if (lambda > r) code |= 2; // right
        if (phi < -r) code |= 4; // below
        else if (phi > r) code |= 8; // above
        return code;
      }

      return clip(visible, clipLine, interpolate, smallRadius ? [0, -radius] : [-pi$1, radius - pi$1]);
    }

    function clipLine(a, b, x0, y0, x1, y1) {
      var ax = a[0],
          ay = a[1],
          bx = b[0],
          by = b[1],
          t0 = 0,
          t1 = 1,
          dx = bx - ax,
          dy = by - ay,
          r;

      r = x0 - ax;
      if (!dx && r > 0) return;
      r /= dx;
      if (dx < 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      } else if (dx > 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      }

      r = x1 - ax;
      if (!dx && r < 0) return;
      r /= dx;
      if (dx < 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      } else if (dx > 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      }

      r = y0 - ay;
      if (!dy && r > 0) return;
      r /= dy;
      if (dy < 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      } else if (dy > 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      }

      r = y1 - ay;
      if (!dy && r < 0) return;
      r /= dy;
      if (dy < 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      } else if (dy > 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      }

      if (t0 > 0) a[0] = ax + t0 * dx, a[1] = ay + t0 * dy;
      if (t1 < 1) b[0] = ax + t1 * dx, b[1] = ay + t1 * dy;
      return true;
    }

    var clipMax = 1e9, clipMin = -clipMax;

    // TODO Use d3-polygon’s polygonContains here for the ring check?
    // TODO Eliminate duplicate buffering in clipBuffer and polygon.push?

    function clipRectangle(x0, y0, x1, y1) {

      function visible(x, y) {
        return x0 <= x && x <= x1 && y0 <= y && y <= y1;
      }

      function interpolate(from, to, direction, stream) {
        var a = 0, a1 = 0;
        if (from == null
            || (a = corner(from, direction)) !== (a1 = corner(to, direction))
            || comparePoint(from, to) < 0 ^ direction > 0) {
          do stream.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0);
          while ((a = (a + direction + 4) % 4) !== a1);
        } else {
          stream.point(to[0], to[1]);
        }
      }

      function corner(p, direction) {
        return abs$1(p[0] - x0) < epsilon$1 ? direction > 0 ? 0 : 3
            : abs$1(p[0] - x1) < epsilon$1 ? direction > 0 ? 2 : 1
            : abs$1(p[1] - y0) < epsilon$1 ? direction > 0 ? 1 : 0
            : direction > 0 ? 3 : 2; // abs(p[1] - y1) < epsilon
      }

      function compareIntersection(a, b) {
        return comparePoint(a.x, b.x);
      }

      function comparePoint(a, b) {
        var ca = corner(a, 1),
            cb = corner(b, 1);
        return ca !== cb ? ca - cb
            : ca === 0 ? b[1] - a[1]
            : ca === 1 ? a[0] - b[0]
            : ca === 2 ? a[1] - b[1]
            : b[0] - a[0];
      }

      return function(stream) {
        var activeStream = stream,
            bufferStream = clipBuffer(),
            segments,
            polygon,
            ring,
            x__, y__, v__, // first point
            x_, y_, v_, // previous point
            first,
            clean;

        var clipStream = {
          point: point,
          lineStart: lineStart,
          lineEnd: lineEnd,
          polygonStart: polygonStart,
          polygonEnd: polygonEnd
        };

        function point(x, y) {
          if (visible(x, y)) activeStream.point(x, y);
        }

        function polygonInside() {
          var winding = 0;

          for (var i = 0, n = polygon.length; i < n; ++i) {
            for (var ring = polygon[i], j = 1, m = ring.length, point = ring[0], a0, a1, b0 = point[0], b1 = point[1]; j < m; ++j) {
              a0 = b0, a1 = b1, point = ring[j], b0 = point[0], b1 = point[1];
              if (a1 <= y1) { if (b1 > y1 && (b0 - a0) * (y1 - a1) > (b1 - a1) * (x0 - a0)) ++winding; }
              else { if (b1 <= y1 && (b0 - a0) * (y1 - a1) < (b1 - a1) * (x0 - a0)) --winding; }
            }
          }

          return winding;
        }

        // Buffer geometry within a polygon and then clip it en masse.
        function polygonStart() {
          activeStream = bufferStream, segments = [], polygon = [], clean = true;
        }

        function polygonEnd() {
          var startInside = polygonInside(),
              cleanInside = clean && startInside,
              visible = (segments = merge(segments)).length;
          if (cleanInside || visible) {
            stream.polygonStart();
            if (cleanInside) {
              stream.lineStart();
              interpolate(null, null, 1, stream);
              stream.lineEnd();
            }
            if (visible) {
              clipRejoin(segments, compareIntersection, startInside, interpolate, stream);
            }
            stream.polygonEnd();
          }
          activeStream = stream, segments = polygon = ring = null;
        }

        function lineStart() {
          clipStream.point = linePoint;
          if (polygon) polygon.push(ring = []);
          first = true;
          v_ = false;
          x_ = y_ = NaN;
        }

        // TODO rather than special-case polygons, simply handle them separately.
        // Ideally, coincident intersection points should be jittered to avoid
        // clipping issues.
        function lineEnd() {
          if (segments) {
            linePoint(x__, y__);
            if (v__ && v_) bufferStream.rejoin();
            segments.push(bufferStream.result());
          }
          clipStream.point = point;
          if (v_) activeStream.lineEnd();
        }

        function linePoint(x, y) {
          var v = visible(x, y);
          if (polygon) ring.push([x, y]);
          if (first) {
            x__ = x, y__ = y, v__ = v;
            first = false;
            if (v) {
              activeStream.lineStart();
              activeStream.point(x, y);
            }
          } else {
            if (v && v_) activeStream.point(x, y);
            else {
              var a = [x_ = Math.max(clipMin, Math.min(clipMax, x_)), y_ = Math.max(clipMin, Math.min(clipMax, y_))],
                  b = [x = Math.max(clipMin, Math.min(clipMax, x)), y = Math.max(clipMin, Math.min(clipMax, y))];
              if (clipLine(a, b, x0, y0, x1, y1)) {
                if (!v_) {
                  activeStream.lineStart();
                  activeStream.point(a[0], a[1]);
                }
                activeStream.point(b[0], b[1]);
                if (!v) activeStream.lineEnd();
                clean = false;
              } else if (v) {
                activeStream.lineStart();
                activeStream.point(x, y);
                clean = false;
              }
            }
          }
          x_ = x, y_ = y, v_ = v;
        }

        return clipStream;
      };
    }

    var identity$5 = x => x;

    var areaSum = new Adder(),
        areaRingSum = new Adder(),
        x00,
        y00,
        x0,
        y0;

    var areaStream = {
      point: noop$2,
      lineStart: noop$2,
      lineEnd: noop$2,
      polygonStart: function() {
        areaStream.lineStart = areaRingStart;
        areaStream.lineEnd = areaRingEnd;
      },
      polygonEnd: function() {
        areaStream.lineStart = areaStream.lineEnd = areaStream.point = noop$2;
        areaSum.add(abs$1(areaRingSum));
        areaRingSum = new Adder();
      },
      result: function() {
        var area = areaSum / 2;
        areaSum = new Adder();
        return area;
      }
    };

    function areaRingStart() {
      areaStream.point = areaPointFirst;
    }

    function areaPointFirst(x, y) {
      areaStream.point = areaPoint;
      x00 = x0 = x, y00 = y0 = y;
    }

    function areaPoint(x, y) {
      areaRingSum.add(y0 * x - x0 * y);
      x0 = x, y0 = y;
    }

    function areaRingEnd() {
      areaPoint(x00, y00);
    }

    var x0$1 = Infinity,
        y0$1 = x0$1,
        x1 = -x0$1,
        y1 = x1;

    var boundsStream = {
      point: boundsPoint,
      lineStart: noop$2,
      lineEnd: noop$2,
      polygonStart: noop$2,
      polygonEnd: noop$2,
      result: function() {
        var bounds = [[x0$1, y0$1], [x1, y1]];
        x1 = y1 = -(y0$1 = x0$1 = Infinity);
        return bounds;
      }
    };

    function boundsPoint(x, y) {
      if (x < x0$1) x0$1 = x;
      if (x > x1) x1 = x;
      if (y < y0$1) y0$1 = y;
      if (y > y1) y1 = y;
    }

    // TODO Enforce positive area for exterior, negative area for interior?

    var X0 = 0,
        Y0 = 0,
        Z0 = 0,
        X1 = 0,
        Y1 = 0,
        Z1 = 0,
        X2 = 0,
        Y2 = 0,
        Z2 = 0,
        x00$1,
        y00$1,
        x0$2,
        y0$2;

    var centroidStream = {
      point: centroidPoint,
      lineStart: centroidLineStart,
      lineEnd: centroidLineEnd,
      polygonStart: function() {
        centroidStream.lineStart = centroidRingStart;
        centroidStream.lineEnd = centroidRingEnd;
      },
      polygonEnd: function() {
        centroidStream.point = centroidPoint;
        centroidStream.lineStart = centroidLineStart;
        centroidStream.lineEnd = centroidLineEnd;
      },
      result: function() {
        var centroid = Z2 ? [X2 / Z2, Y2 / Z2]
            : Z1 ? [X1 / Z1, Y1 / Z1]
            : Z0 ? [X0 / Z0, Y0 / Z0]
            : [NaN, NaN];
        X0 = Y0 = Z0 =
        X1 = Y1 = Z1 =
        X2 = Y2 = Z2 = 0;
        return centroid;
      }
    };

    function centroidPoint(x, y) {
      X0 += x;
      Y0 += y;
      ++Z0;
    }

    function centroidLineStart() {
      centroidStream.point = centroidPointFirstLine;
    }

    function centroidPointFirstLine(x, y) {
      centroidStream.point = centroidPointLine;
      centroidPoint(x0$2 = x, y0$2 = y);
    }

    function centroidPointLine(x, y) {
      var dx = x - x0$2, dy = y - y0$2, z = sqrt(dx * dx + dy * dy);
      X1 += z * (x0$2 + x) / 2;
      Y1 += z * (y0$2 + y) / 2;
      Z1 += z;
      centroidPoint(x0$2 = x, y0$2 = y);
    }

    function centroidLineEnd() {
      centroidStream.point = centroidPoint;
    }

    function centroidRingStart() {
      centroidStream.point = centroidPointFirstRing;
    }

    function centroidRingEnd() {
      centroidPointRing(x00$1, y00$1);
    }

    function centroidPointFirstRing(x, y) {
      centroidStream.point = centroidPointRing;
      centroidPoint(x00$1 = x0$2 = x, y00$1 = y0$2 = y);
    }

    function centroidPointRing(x, y) {
      var dx = x - x0$2,
          dy = y - y0$2,
          z = sqrt(dx * dx + dy * dy);

      X1 += z * (x0$2 + x) / 2;
      Y1 += z * (y0$2 + y) / 2;
      Z1 += z;

      z = y0$2 * x - x0$2 * y;
      X2 += z * (x0$2 + x);
      Y2 += z * (y0$2 + y);
      Z2 += z * 3;
      centroidPoint(x0$2 = x, y0$2 = y);
    }

    function PathContext(context) {
      this._context = context;
    }

    PathContext.prototype = {
      _radius: 4.5,
      pointRadius: function(_) {
        return this._radius = _, this;
      },
      polygonStart: function() {
        this._line = 0;
      },
      polygonEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._point = 0;
      },
      lineEnd: function() {
        if (this._line === 0) this._context.closePath();
        this._point = NaN;
      },
      point: function(x, y) {
        switch (this._point) {
          case 0: {
            this._context.moveTo(x, y);
            this._point = 1;
            break;
          }
          case 1: {
            this._context.lineTo(x, y);
            break;
          }
          default: {
            this._context.moveTo(x + this._radius, y);
            this._context.arc(x, y, this._radius, 0, tau$1);
            break;
          }
        }
      },
      result: noop$2
    };

    var lengthSum = new Adder(),
        lengthRing,
        x00$2,
        y00$2,
        x0$3,
        y0$3;

    var lengthStream = {
      point: noop$2,
      lineStart: function() {
        lengthStream.point = lengthPointFirst;
      },
      lineEnd: function() {
        if (lengthRing) lengthPoint(x00$2, y00$2);
        lengthStream.point = noop$2;
      },
      polygonStart: function() {
        lengthRing = true;
      },
      polygonEnd: function() {
        lengthRing = null;
      },
      result: function() {
        var length = +lengthSum;
        lengthSum = new Adder();
        return length;
      }
    };

    function lengthPointFirst(x, y) {
      lengthStream.point = lengthPoint;
      x00$2 = x0$3 = x, y00$2 = y0$3 = y;
    }

    function lengthPoint(x, y) {
      x0$3 -= x, y0$3 -= y;
      lengthSum.add(sqrt(x0$3 * x0$3 + y0$3 * y0$3));
      x0$3 = x, y0$3 = y;
    }

    function PathString() {
      this._string = [];
    }

    PathString.prototype = {
      _radius: 4.5,
      _circle: circle(4.5),
      pointRadius: function(_) {
        if ((_ = +_) !== this._radius) this._radius = _, this._circle = null;
        return this;
      },
      polygonStart: function() {
        this._line = 0;
      },
      polygonEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._point = 0;
      },
      lineEnd: function() {
        if (this._line === 0) this._string.push("Z");
        this._point = NaN;
      },
      point: function(x, y) {
        switch (this._point) {
          case 0: {
            this._string.push("M", x, ",", y);
            this._point = 1;
            break;
          }
          case 1: {
            this._string.push("L", x, ",", y);
            break;
          }
          default: {
            if (this._circle == null) this._circle = circle(this._radius);
            this._string.push("M", x, ",", y, this._circle);
            break;
          }
        }
      },
      result: function() {
        if (this._string.length) {
          var result = this._string.join("");
          this._string = [];
          return result;
        } else {
          return null;
        }
      }
    };

    function circle(radius) {
      return "m0," + radius
          + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius
          + "a" + radius + "," + radius + " 0 1,1 0," + 2 * radius
          + "z";
    }

    function geoPath(projection, context) {
      var pointRadius = 4.5,
          projectionStream,
          contextStream;

      function path(object) {
        if (object) {
          if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
          geoStream(object, projectionStream(contextStream));
        }
        return contextStream.result();
      }

      path.area = function(object) {
        geoStream(object, projectionStream(areaStream));
        return areaStream.result();
      };

      path.measure = function(object) {
        geoStream(object, projectionStream(lengthStream));
        return lengthStream.result();
      };

      path.bounds = function(object) {
        geoStream(object, projectionStream(boundsStream));
        return boundsStream.result();
      };

      path.centroid = function(object) {
        geoStream(object, projectionStream(centroidStream));
        return centroidStream.result();
      };

      path.projection = function(_) {
        return arguments.length ? (projectionStream = _ == null ? (projection = null, identity$5) : (projection = _).stream, path) : projection;
      };

      path.context = function(_) {
        if (!arguments.length) return context;
        contextStream = _ == null ? (context = null, new PathString) : new PathContext(context = _);
        if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
        return path;
      };

      path.pointRadius = function(_) {
        if (!arguments.length) return pointRadius;
        pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
        return path;
      };

      return path.projection(projection).context(context);
    }

    function transformer$1(methods) {
      return function(stream) {
        var s = new TransformStream;
        for (var key in methods) s[key] = methods[key];
        s.stream = stream;
        return s;
      };
    }

    function TransformStream() {}

    TransformStream.prototype = {
      constructor: TransformStream,
      point: function(x, y) { this.stream.point(x, y); },
      sphere: function() { this.stream.sphere(); },
      lineStart: function() { this.stream.lineStart(); },
      lineEnd: function() { this.stream.lineEnd(); },
      polygonStart: function() { this.stream.polygonStart(); },
      polygonEnd: function() { this.stream.polygonEnd(); }
    };

    function fit(projection, fitBounds, object) {
      var clip = projection.clipExtent && projection.clipExtent();
      projection.scale(150).translate([0, 0]);
      if (clip != null) projection.clipExtent(null);
      geoStream(object, projection.stream(boundsStream));
      fitBounds(boundsStream.result());
      if (clip != null) projection.clipExtent(clip);
      return projection;
    }

    function fitExtent(projection, extent, object) {
      return fit(projection, function(b) {
        var w = extent[1][0] - extent[0][0],
            h = extent[1][1] - extent[0][1],
            k = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1])),
            x = +extent[0][0] + (w - k * (b[1][0] + b[0][0])) / 2,
            y = +extent[0][1] + (h - k * (b[1][1] + b[0][1])) / 2;
        projection.scale(150 * k).translate([x, y]);
      }, object);
    }

    function fitSize(projection, size, object) {
      return fitExtent(projection, [[0, 0], size], object);
    }

    function fitWidth(projection, width, object) {
      return fit(projection, function(b) {
        var w = +width,
            k = w / (b[1][0] - b[0][0]),
            x = (w - k * (b[1][0] + b[0][0])) / 2,
            y = -k * b[0][1];
        projection.scale(150 * k).translate([x, y]);
      }, object);
    }

    function fitHeight(projection, height, object) {
      return fit(projection, function(b) {
        var h = +height,
            k = h / (b[1][1] - b[0][1]),
            x = -k * b[0][0],
            y = (h - k * (b[1][1] + b[0][1])) / 2;
        projection.scale(150 * k).translate([x, y]);
      }, object);
    }

    var maxDepth = 16, // maximum depth of subdivision
        cosMinDistance = cos$1(30 * radians$1); // cos(minimum angular distance)

    function resample(project, delta2) {
      return +delta2 ? resample$1(project, delta2) : resampleNone(project);
    }

    function resampleNone(project) {
      return transformer$1({
        point: function(x, y) {
          x = project(x, y);
          this.stream.point(x[0], x[1]);
        }
      });
    }

    function resample$1(project, delta2) {

      function resampleLineTo(x0, y0, lambda0, a0, b0, c0, x1, y1, lambda1, a1, b1, c1, depth, stream) {
        var dx = x1 - x0,
            dy = y1 - y0,
            d2 = dx * dx + dy * dy;
        if (d2 > 4 * delta2 && depth--) {
          var a = a0 + a1,
              b = b0 + b1,
              c = c0 + c1,
              m = sqrt(a * a + b * b + c * c),
              phi2 = asin(c /= m),
              lambda2 = abs$1(abs$1(c) - 1) < epsilon$1 || abs$1(lambda0 - lambda1) < epsilon$1 ? (lambda0 + lambda1) / 2 : atan2$1(b, a),
              p = project(lambda2, phi2),
              x2 = p[0],
              y2 = p[1],
              dx2 = x2 - x0,
              dy2 = y2 - y0,
              dz = dy * dx2 - dx * dy2;
          if (dz * dz / d2 > delta2 // perpendicular projected distance
              || abs$1((dx * dx2 + dy * dy2) / d2 - 0.5) > 0.3 // midpoint close to an end
              || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) { // angular distance
            resampleLineTo(x0, y0, lambda0, a0, b0, c0, x2, y2, lambda2, a /= m, b /= m, c, depth, stream);
            stream.point(x2, y2);
            resampleLineTo(x2, y2, lambda2, a, b, c, x1, y1, lambda1, a1, b1, c1, depth, stream);
          }
        }
      }
      return function(stream) {
        var lambda00, x00, y00, a00, b00, c00, // first point
            lambda0, x0, y0, a0, b0, c0; // previous point

        var resampleStream = {
          point: point,
          lineStart: lineStart,
          lineEnd: lineEnd,
          polygonStart: function() { stream.polygonStart(); resampleStream.lineStart = ringStart; },
          polygonEnd: function() { stream.polygonEnd(); resampleStream.lineStart = lineStart; }
        };

        function point(x, y) {
          x = project(x, y);
          stream.point(x[0], x[1]);
        }

        function lineStart() {
          x0 = NaN;
          resampleStream.point = linePoint;
          stream.lineStart();
        }

        function linePoint(lambda, phi) {
          var c = cartesian([lambda, phi]), p = project(lambda, phi);
          resampleLineTo(x0, y0, lambda0, a0, b0, c0, x0 = p[0], y0 = p[1], lambda0 = lambda, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
          stream.point(x0, y0);
        }

        function lineEnd() {
          resampleStream.point = point;
          stream.lineEnd();
        }

        function ringStart() {
          lineStart();
          resampleStream.point = ringPoint;
          resampleStream.lineEnd = ringEnd;
        }

        function ringPoint(lambda, phi) {
          linePoint(lambda00 = lambda, phi), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
          resampleStream.point = linePoint;
        }

        function ringEnd() {
          resampleLineTo(x0, y0, lambda0, a0, b0, c0, x00, y00, lambda00, a00, b00, c00, maxDepth, stream);
          resampleStream.lineEnd = lineEnd;
          lineEnd();
        }

        return resampleStream;
      };
    }

    var transformRadians = transformer$1({
      point: function(x, y) {
        this.stream.point(x * radians$1, y * radians$1);
      }
    });

    function transformRotate(rotate) {
      return transformer$1({
        point: function(x, y) {
          var r = rotate(x, y);
          return this.stream.point(r[0], r[1]);
        }
      });
    }

    function scaleTranslate(k, dx, dy, sx, sy) {
      function transform(x, y) {
        x *= sx; y *= sy;
        return [dx + k * x, dy - k * y];
      }
      transform.invert = function(x, y) {
        return [(x - dx) / k * sx, (dy - y) / k * sy];
      };
      return transform;
    }

    function scaleTranslateRotate(k, dx, dy, sx, sy, alpha) {
      if (!alpha) return scaleTranslate(k, dx, dy, sx, sy);
      var cosAlpha = cos$1(alpha),
          sinAlpha = sin$1(alpha),
          a = cosAlpha * k,
          b = sinAlpha * k,
          ai = cosAlpha / k,
          bi = sinAlpha / k,
          ci = (sinAlpha * dy - cosAlpha * dx) / k,
          fi = (sinAlpha * dx + cosAlpha * dy) / k;
      function transform(x, y) {
        x *= sx; y *= sy;
        return [a * x - b * y + dx, dy - b * x - a * y];
      }
      transform.invert = function(x, y) {
        return [sx * (ai * x - bi * y + ci), sy * (fi - bi * x - ai * y)];
      };
      return transform;
    }

    function projection(project) {
      return projectionMutator(function() { return project; })();
    }

    function projectionMutator(projectAt) {
      var project,
          k = 150, // scale
          x = 480, y = 250, // translate
          lambda = 0, phi = 0, // center
          deltaLambda = 0, deltaPhi = 0, deltaGamma = 0, rotate, // pre-rotate
          alpha = 0, // post-rotate angle
          sx = 1, // reflectX
          sy = 1, // reflectX
          theta = null, preclip = clipAntimeridian, // pre-clip angle
          x0 = null, y0, x1, y1, postclip = identity$5, // post-clip extent
          delta2 = 0.5, // precision
          projectResample,
          projectTransform,
          projectRotateTransform,
          cache,
          cacheStream;

      function projection(point) {
        return projectRotateTransform(point[0] * radians$1, point[1] * radians$1);
      }

      function invert(point) {
        point = projectRotateTransform.invert(point[0], point[1]);
        return point && [point[0] * degrees$1, point[1] * degrees$1];
      }

      projection.stream = function(stream) {
        return cache && cacheStream === stream ? cache : cache = transformRadians(transformRotate(rotate)(preclip(projectResample(postclip(cacheStream = stream)))));
      };

      projection.preclip = function(_) {
        return arguments.length ? (preclip = _, theta = undefined, reset()) : preclip;
      };

      projection.postclip = function(_) {
        return arguments.length ? (postclip = _, x0 = y0 = x1 = y1 = null, reset()) : postclip;
      };

      projection.clipAngle = function(_) {
        return arguments.length ? (preclip = +_ ? clipCircle(theta = _ * radians$1) : (theta = null, clipAntimeridian), reset()) : theta * degrees$1;
      };

      projection.clipExtent = function(_) {
        return arguments.length ? (postclip = _ == null ? (x0 = y0 = x1 = y1 = null, identity$5) : clipRectangle(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]), reset()) : x0 == null ? null : [[x0, y0], [x1, y1]];
      };

      projection.scale = function(_) {
        return arguments.length ? (k = +_, recenter()) : k;
      };

      projection.translate = function(_) {
        return arguments.length ? (x = +_[0], y = +_[1], recenter()) : [x, y];
      };

      projection.center = function(_) {
        return arguments.length ? (lambda = _[0] % 360 * radians$1, phi = _[1] % 360 * radians$1, recenter()) : [lambda * degrees$1, phi * degrees$1];
      };

      projection.rotate = function(_) {
        return arguments.length ? (deltaLambda = _[0] % 360 * radians$1, deltaPhi = _[1] % 360 * radians$1, deltaGamma = _.length > 2 ? _[2] % 360 * radians$1 : 0, recenter()) : [deltaLambda * degrees$1, deltaPhi * degrees$1, deltaGamma * degrees$1];
      };

      projection.angle = function(_) {
        return arguments.length ? (alpha = _ % 360 * radians$1, recenter()) : alpha * degrees$1;
      };

      projection.reflectX = function(_) {
        return arguments.length ? (sx = _ ? -1 : 1, recenter()) : sx < 0;
      };

      projection.reflectY = function(_) {
        return arguments.length ? (sy = _ ? -1 : 1, recenter()) : sy < 0;
      };

      projection.precision = function(_) {
        return arguments.length ? (projectResample = resample(projectTransform, delta2 = _ * _), reset()) : sqrt(delta2);
      };

      projection.fitExtent = function(extent, object) {
        return fitExtent(projection, extent, object);
      };

      projection.fitSize = function(size, object) {
        return fitSize(projection, size, object);
      };

      projection.fitWidth = function(width, object) {
        return fitWidth(projection, width, object);
      };

      projection.fitHeight = function(height, object) {
        return fitHeight(projection, height, object);
      };

      function recenter() {
        var center = scaleTranslateRotate(k, 0, 0, sx, sy, alpha).apply(null, project(lambda, phi)),
            transform = scaleTranslateRotate(k, x - center[0], y - center[1], sx, sy, alpha);
        rotate = rotateRadians(deltaLambda, deltaPhi, deltaGamma);
        projectTransform = compose(project, transform);
        projectRotateTransform = compose(rotate, projectTransform);
        projectResample = resample(projectTransform, delta2);
        return reset();
      }

      function reset() {
        cache = cacheStream = null;
        return projection;
      }

      return function() {
        project = projectAt.apply(this, arguments);
        projection.invert = project.invert && invert;
        return recenter();
      };
    }

    function mercatorRaw(lambda, phi) {
      return [lambda, log(tan((halfPi + phi) / 2))];
    }

    mercatorRaw.invert = function(x, y) {
      return [x, 2 * atan(exp(y)) - halfPi];
    };

    function geoMercator() {
      return mercatorProjection(mercatorRaw)
          .scale(961 / tau$1);
    }

    function mercatorProjection(project) {
      var m = projection(project),
          center = m.center,
          scale = m.scale,
          translate = m.translate,
          clipExtent = m.clipExtent,
          x0 = null, y0, x1, y1; // clip extent

      m.scale = function(_) {
        return arguments.length ? (scale(_), reclip()) : scale();
      };

      m.translate = function(_) {
        return arguments.length ? (translate(_), reclip()) : translate();
      };

      m.center = function(_) {
        return arguments.length ? (center(_), reclip()) : center();
      };

      m.clipExtent = function(_) {
        return arguments.length ? ((_ == null ? x0 = y0 = x1 = y1 = null : (x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1])), reclip()) : x0 == null ? null : [[x0, y0], [x1, y1]];
      };

      function reclip() {
        var k = pi$1 * scale(),
            t = m(rotation(m.rotate()).invert([0, 0]));
        return clipExtent(x0 == null
            ? [[t[0] - k, t[1] - k], [t[0] + k, t[1] + k]] : project === mercatorRaw
            ? [[Math.max(t[0] - k, x0), y0], [Math.min(t[0] + k, x1), y1]]
            : [[x0, Math.max(t[1] - k, y0)], [x1, Math.min(t[1] + k, y1)]]);
      }

      return reclip();
    }

    // // Get gestolen personenauto's in 2019
    // export const data = {}
    // let index = 0;
    // for (const i in rawData) {
    //   if (i == 0) {
    //     index = rawData[i].indexOf("gest19 Personenauto")
    //   } else {
    //     data[rawData[i][0]] = {"aantalGestolen": parseInt(rawData[i][index])}
    //   }
    // }

    // // Get inwoners
    // for (var i = 0; i < rawData.length; i += 2) {
    //   if (data[rawData[i]]) {
    //     data[rawData[i]].inwoners = parseInt(rawData[i+1].replace(".", ""))
    //   }
    // }

    // // Get wagenpark
    // for (const item of rawData) {
    //   const splitItem = item.split("	").join(" ").split(" ")
    //   const gemeente = splitItem.slice(0, splitItem.length-3).join(" ")
    //   const jaar2017 = parseInt(splitItem[splitItem.length-1])
    //   const jaar2018 = parseInt(splitItem[splitItem.length-2])
    //   const jaar2019 = parseInt(splitItem[splitItem.length-3])
    //   if (data[gemeente]) {
    //     data[gemeente].wagenpark = jaar2019 || jaar2018 || jaar2017;
    //   }
    // }

    const gestolenPerGemeente = {
      "Aa en Hunze": {
        "aantalGestolen": 0,
        "inwoners": 25390,
        "wagenpark": 14178
      },
      "Aalsmeer": {
        "aantalGestolen": 3,
        "inwoners": 31499,
        "wagenpark": 16547
      },
      "Aalten": {
        "aantalGestolen": 0,
        "inwoners": 26962,
        "wagenpark": 13696
      },
      "Achtkarspelen": {
        "aantalGestolen": 0,
        "inwoners": 27935,
        "wagenpark": 14393
      },
      "Alblasserdam": {
        "aantalGestolen": 2,
        "inwoners": 20014,
        "wagenpark": 8920
      },
      "Albrandswaard": {
        "aantalGestolen": 2,
        "inwoners": 25218,
        "wagenpark": 12199
      },
      "Alkmaar": {
        "aantalGestolen": 17,
        "inwoners": 108470,
        "wagenpark": 47756
      },
      "Almelo": {
        "aantalGestolen": 14,
        "inwoners": 72629,
        "wagenpark": 32894
      },
      "Almere": {
        "aantalGestolen": 56,
        "inwoners": 203990,
        "wagenpark": 243388
      },
      "Alphen aan den Rijn": {
        "aantalGestolen": 21,
        "inwoners": 109682,
        "wagenpark": 50254
      },
      "Alphen-Chaam": {
        "aantalGestolen": 1,
        "inwoners": 10083,
        "wagenpark": 5995
      },
      "Altena": {
        "aantalGestolen": 7,
        "inwoners": 54766,
        "wagenpark": 29363
      },
      "Ameland": {
        "aantalGestolen": 0,
        "inwoners": 3654,
        "wagenpark": 1762
      },
      "Amersfoort": {
        "aantalGestolen": 17,
        "inwoners": 155226,
        "wagenpark": 99583
      },
      "Amstelveen": {
        "aantalGestolen": 22,
        "inwoners": 89870,
        "wagenpark": 38235
      },
      "Amsterdam": {
        "aantalGestolen": 534,
        "inwoners": 854047,
        "wagenpark": 233715
      },
      "Apeldoorn": {
        "aantalGestolen": 29,
        "inwoners": 161156,
        "wagenpark": 79817
      },
      "Appingedam": {
        "aantalGestolen": 0,
        "inwoners": 11801,
        "wagenpark": 5406
      },
      "Arnhem": {
        "aantalGestolen": 47,
        "inwoners": 157223,
        "wagenpark": 63196
      },
      "Assen": {
        "aantalGestolen": 4,
        "inwoners": 67708,
        "wagenpark": 32582
      },
      "Asten": {
        "aantalGestolen": 7,
        "inwoners": 16719,
        "wagenpark": 8819
      },
      "Baarle-Nassau": {
        "aantalGestolen": 0,
        "inwoners": 6799,
        "wagenpark": 3991
      },
      "Baarn": {
        "aantalGestolen": 4,
        "inwoners": 24630,
        "wagenpark": 11986
      },
      "Barendrecht": {
        "aantalGestolen": 11,
        "inwoners": 48477,
        "wagenpark": 22710
      },
      "Barneveld": {
        "aantalGestolen": 4,
        "inwoners": 57339,
        "wagenpark": 27322
      },
      "Beek": {
        "aantalGestolen": 1,
        "inwoners": 15895,
        "wagenpark": 9390
      },
      "Beekdaelen": {
        "aantalGestolen": 13,
        "inwoners": 35969,
        "wagenpark": 21646
      },
      "Beemster": {
        "aantalGestolen": 1,
        "inwoners": 9550,
        "wagenpark": 4827
      },
      "Beesel": {
        "aantalGestolen": 0,
        "inwoners": 13444,
        "wagenpark": 6733
      },
      "Berg en Dal": {
        "aantalGestolen": 4,
        "inwoners": 34748,
        "wagenpark": 17672
      },
      "Bergeijk": {
        "aantalGestolen": 0,
        "inwoners": 18398,
        "wagenpark": 10328
      },
      "Bergen (L.)": {
        "aantalGestolen": 0,
        "inwoners": 13106,
        "wagenpark": 7516
      },
      "Bergen (NH.)": {
        "aantalGestolen": 4,
        "inwoners": 29941,
        "wagenpark": 15450
      },
      "Bergen op Zoom": {
        "aantalGestolen": 12,
        "inwoners": 66354,
        "wagenpark": 31435
      },
      "Berkelland": {
        "aantalGestolen": 1,
        "inwoners": 44029,
        "wagenpark": 23878
      },
      "Bernheze": {
        "aantalGestolen": 8,
        "inwoners": 30550,
        "wagenpark": 15908
      },
      "Best": {
        "aantalGestolen": 10,
        "inwoners": 29497,
        "wagenpark": 14851
      },
      "Beuningen": {
        "aantalGestolen": 5,
        "inwoners": 25798,
        "wagenpark": 13253
      },
      "Beverwijk": {
        "aantalGestolen": 8,
        "inwoners": 41077,
        "wagenpark": 18132
      },
      "Bladel": {
        "aantalGestolen": 4,
        "inwoners": 20144,
        "wagenpark": 11117
      },
      "Blaricum": {
        "aantalGestolen": 0,
        "inwoners": 10795,
        "wagenpark": 5974
      },
      "Bloemendaal": {
        "aantalGestolen": 3,
        "inwoners": 23208,
        "wagenpark": 11873
      },
      "Bodegraven-Reeuwijk": {
        "aantalGestolen": 7,
        "inwoners": 33948,
        "wagenpark": 16097
      },
      "Boekel": {
        "aantalGestolen": 1,
        "inwoners": 10502,
        "wagenpark": 5587
      },
      "Borger-Odoorn": {
        "aantalGestolen": 1,
        "inwoners": 25351,
        "wagenpark": 14708
      },
      "Borne": {
        "aantalGestolen": 2,
        "inwoners": 23124,
        "wagenpark": 11247
      },
      "Borsele": {
        "aantalGestolen": 1,
        "inwoners": 22716,
        "wagenpark": 12607
      },
      "Boxmeer": {
        "aantalGestolen": 6,
        "inwoners": 28853,
        "wagenpark": 14996
      },
      "Boxtel": {
        "aantalGestolen": 5,
        "inwoners": 30672,
        "wagenpark": 14527
      },
      "Breda": {
        "aantalGestolen": 58,
        "inwoners": 183448,
        "wagenpark": 150614
      },
      "Brielle": {
        "aantalGestolen": 1,
        "inwoners": 17040,
        "wagenpark": 9130
      },
      "Bronckhorst": {
        "aantalGestolen": 2,
        "inwoners": 36352,
        "wagenpark": 20852
      },
      "Brummen": {
        "aantalGestolen": 1,
        "inwoners": 20771,
        "wagenpark": 10963
      },
      "Brunssum": {
        "aantalGestolen": 21,
        "inwoners": 28241,
        "wagenpark": 15068
      },
      "Bunnik": {
        "aantalGestolen": 0,
        "inwoners": 15214,
        "wagenpark": 7240
      },
      "Bunschoten": {
        "aantalGestolen": 1,
        "inwoners": 21266,
        "wagenpark": 9122
      },
      "Buren": {
        "aantalGestolen": 2,
        "inwoners": 26365,
        "wagenpark": 15158
      },
      "Capelle aan den IJssel": {
        "aantalGestolen": 12,
        "inwoners": 66854,
        "wagenpark": 30461
      },
      "Castricum": {
        "aantalGestolen": 4,
        "inwoners": 35608,
        "wagenpark": 16502
      },
      "Coevorden": {
        "aantalGestolen": 4,
        "inwoners": 35299,
        "wagenpark": 18803
      },
      "Cranendonck": {
        "aantalGestolen": 3,
        "inwoners": 20336,
        "wagenpark": 11667
      },
      "Cuijk": {
        "aantalGestolen": 9,
        "inwoners": 24911,
        "wagenpark": 12836
      },
      "Culemborg": {
        "aantalGestolen": 3,
        "inwoners": 28195,
        "wagenpark": 12745
      },
      "Dalfsen": {
        "aantalGestolen": 0,
        "inwoners": 28242,
        "wagenpark": 15658
      },
      "Dantumadiel": {
        "aantalGestolen": 0,
        "inwoners": 18904,
        "wagenpark": 9619
      },
      "De Bilt": {
        "aantalGestolen": 6,
        "inwoners": 42846,
        "wagenpark": 20868
      },
      "De Fryske Marren": {
        "aantalGestolen": 0,
        "inwoners": 51742,
        "wagenpark": 27016
      },
      "De Ronde Venen": {
        "aantalGestolen": 4,
        "inwoners": 43620,
        "wagenpark": 22217
      },
      "De Wolden": {
        "aantalGestolen": 0,
        "inwoners": 23917,
        "wagenpark": 13591
      },
      "Delft": {
        "aantalGestolen": 22,
        "inwoners": 102253,
        "wagenpark": 32380
      },
      "Delfzijl": {
        "aantalGestolen": 4,
        "inwoners": 24864,
        "wagenpark": 12154
      },
      "Den Helder": {
        "aantalGestolen": 3,
        "inwoners": 55760,
        "wagenpark": 24396
      },
      "Deurne": {
        "aantalGestolen": 9,
        "inwoners": 32137,
        "wagenpark": 16395
      },
      "Deventer": {
        "aantalGestolen": 11,
        "inwoners": 99653,
        "wagenpark": 42857
      },
      "Diemen": {
        "aantalGestolen": 15,
        "inwoners": 28121,
        "wagenpark": 9666
      },
      "Dinkelland": {
        "aantalGestolen": 0,
        "inwoners": 26291,
        "wagenpark": 13929
      },
      "Doesburg": {
        "aantalGestolen": 1,
        "inwoners": 11328,
        "wagenpark": 5553
      },
      "Doetinchem": {
        "aantalGestolen": 5,
        "inwoners": 57382,
        "wagenpark": 28692
      },
      "Dongen": {
        "aantalGestolen": 0,
        "inwoners": 25777,
        "wagenpark": 13485
      },
      "Dordrecht": {
        "aantalGestolen": 26,
        "inwoners": 118426,
        "wagenpark": 55096
      },
      "Drechterland": {
        "aantalGestolen": 1,
        "inwoners": 19440,
        "wagenpark": 9633
      },
      "Drimmelen": {
        "aantalGestolen": 3,
        "inwoners": 27063,
        "wagenpark": 14520
      },
      "Dronten": {
        "aantalGestolen": 6,
        "inwoners": 40735,
        "wagenpark": 20256
      },
      "Druten": {
        "aantalGestolen": 6,
        "inwoners": 18701,
        "wagenpark": 9635
      },
      "Duiven": {
        "aantalGestolen": 5,
        "inwoners": 25438,
        "wagenpark": 12613
      },
      "Echt-Susteren": {
        "aantalGestolen": 4,
        "inwoners": 31751,
        "wagenpark": 18070
      },
      "Edam-Volendam": {
        "aantalGestolen": 1,
        "inwoners": 35953,
        "wagenpark": 14366
      },
      "Ede": {
        "aantalGestolen": 6,
        "inwoners": 114682,
        "wagenpark": 53609
      },
      "Eemnes": {
        "aantalGestolen": 0,
        "inwoners": 9112,
        "wagenpark": 5007
      },
      "Eersel": {
        "aantalGestolen": 1,
        "inwoners": 18778,
        "wagenpark": 10627
      },
      "Eijsden-Margraten": {
        "aantalGestolen": 7,
        "inwoners": 25566,
        "wagenpark": 14066
      },
      "Eindhoven": {
        "aantalGestolen": 86,
        "inwoners": 229126,
        "wagenpark": 99653
      },
      "Elburg": {
        "aantalGestolen": 5,
        "inwoners": 23107,
        "wagenpark": 11408
      },
      "Emmen": {
        "aantalGestolen": 11,
        "inwoners": 107192,
        "wagenpark": 54609
      },
      "Enkhuizen": {
        "aantalGestolen": 1,
        "inwoners": 18476,
        "wagenpark": 7706
      },
      "Enschede": {
        "aantalGestolen": 15,
        "inwoners": 158261,
        "wagenpark": 65988
      },
      "Epe": {
        "aantalGestolen": 2,
        "inwoners": 32863,
        "wagenpark": 17397
      },
      "Ermelo": {
        "aantalGestolen": 2,
        "inwoners": 26793,
        "wagenpark": 12970
      },
      "Etten-Leur": {
        "aantalGestolen": 12,
        "inwoners": 43532,
        "wagenpark": 21375
      },
      "Geertruidenberg": {
        "aantalGestolen": 4,
        "inwoners": 21517,
        "wagenpark": 11290
      },
      "Geldrop-Mierlo": {
        "aantalGestolen": 13,
        "inwoners": 39252,
        "wagenpark": 20500
      },
      "Gemert-Bakel": {
        "aantalGestolen": 4,
        "inwoners": 30340,
        "wagenpark": 15871
      },
      "Gennep": {
        "aantalGestolen": 1,
        "inwoners": 17052,
        "wagenpark": 9187
      },
      "Gilze en Rijen": {
        "aantalGestolen": 1,
        "inwoners": 26313,
        "wagenpark": 13389
      },
      "Goeree-Overflakkee": {
        "aantalGestolen": 3,
        "inwoners": 49129,
        "wagenpark": 25144
      },
      "Goes": {
        "aantalGestolen": 3,
        "inwoners": 37636,
        "wagenpark": 19584
      },
      "Goirle": {
        "aantalGestolen": 2,
        "inwoners": 23621,
        "wagenpark": 11774
      },
      "Gooise Meren": {
        "aantalGestolen": 17,
        "inwoners": 57337,
        "wagenpark": 27319
      },
      "Gorinchem": {
        "aantalGestolen": 0,
        "inwoners": 36284,
        "wagenpark": 15594
      },
      "Gouda": {
        "aantalGestolen": 7,
        "inwoners": 72700,
        "wagenpark": 27585
      },
      "Grave": {
        "aantalGestolen": 1,
        "inwoners": 12419,
        "wagenpark": 6615
      },
      "Groningen": {
        "aantalGestolen": 18,
        "inwoners": 229962,
        "wagenpark": 71803
      },
      "Gulpen-Wittem": {
        "aantalGestolen": 4,
        "inwoners": 14196,
        "wagenpark": 8153
      },
      "Haaksbergen": {
        "aantalGestolen": 0,
        "inwoners": 24291,
        "wagenpark": 12773
      },
      "Haaren": {
        "aantalGestolen": 0,
        "inwoners": 14103,
        "wagenpark": 7536
      },
      "Haarlem": {
        "aantalGestolen": 42,
        "inwoners": 159709,
        "wagenpark": 60085
      },
      "Haarlemmermeer": {
        "aantalGestolen": 41,
        "inwoners": 153149,
        "wagenpark": 107167
      },
      "Halderberge": {
        "aantalGestolen": 9,
        "inwoners": 29888,
        "wagenpark": 15892
      },
      "Hardenberg": {
        "aantalGestolen": 5,
        "inwoners": 60539,
        "wagenpark": 31118
      },
      "Harderwijk": {
        "aantalGestolen": 2,
        "inwoners": 46832,
        "wagenpark": 21160
      },
      "Hardinxveld-Giessendam": {
        "aantalGestolen": 1,
        "inwoners": 17958,
        "wagenpark": 8282
      },
      "Harlingen": {
        "aantalGestolen": 1,
        "inwoners": 15783,
        "wagenpark": 6946
      },
      "Hattem": {
        "aantalGestolen": 0,
        "inwoners": 12154,
        "wagenpark": 5903
      },
      "Heemskerk": {
        "aantalGestolen": 7,
        "inwoners": 39146,
        "wagenpark": 18161
      },
      "Heemstede": {
        "aantalGestolen": 3,
        "inwoners": 27080,
        "wagenpark": 13008
      },
      "Heerde": {
        "aantalGestolen": 0,
        "inwoners": 18603,
        "wagenpark": 9802
      },
      "Heerenveen": {
        "aantalGestolen": 1,
        "inwoners": 50192,
        "wagenpark": 24921
      },
      "Heerhugowaard": {
        "aantalGestolen": 9,
        "inwoners": 55850,
        "wagenpark": 28285
      },
      "Heerlen": {
        "aantalGestolen": 35,
        "inwoners": 86762,
        "wagenpark": 43291
      },
      "Heeze-Leende": {
        "aantalGestolen": 1,
        "inwoners": 15886,
        "wagenpark": 8752
      },
      "Heiloo": {
        "aantalGestolen": 1,
        "inwoners": 23099,
        "wagenpark": 10849
      },
      "Hellendoorn": {
        "aantalGestolen": 2,
        "inwoners": 35796,
        "wagenpark": 18868
      },
      "Hellevoetsluis": {
        "aantalGestolen": 2,
        "inwoners": 39997,
        "wagenpark": 19708
      },
      "Helmond": {
        "aantalGestolen": 31,
        "inwoners": 90903,
        "wagenpark": 41976
      },
      "Hendrik-Ido-Ambacht": {
        "aantalGestolen": 6,
        "inwoners": 30677,
        "wagenpark": 13678
      },
      "Hengelo": {
        "aantalGestolen": 4,
        "inwoners": 80593,
        "wagenpark": 41083
      },
      "Het Hogeland": {
        "aantalGestolen": 1,
        "inwoners": 48019,
        "wagenpark": 24209
      },
      "Heumen": {
        "aantalGestolen": 6,
        "inwoners": 16462,
        "wagenpark": 8420
      },
      "Heusden": {
        "aantalGestolen": 6,
        "inwoners": 43723,
        "wagenpark": 23046
      },
      "Hillegom": {
        "aantalGestolen": 1,
        "inwoners": 21812,
        "wagenpark": 11122
      },
      "Hilvarenbeek": {
        "aantalGestolen": 0,
        "inwoners": 15366,
        "wagenpark": 8567
      },
      "Hilversum": {
        "aantalGestolen": 19,
        "inwoners": 89521,
        "wagenpark": 41531
      },
      "Hoeksche Waard": {
        "aantalGestolen": 2,
        "inwoners": 86115,
        "wagenpark": 46493
      },
      "Hof van Twente": {
        "aantalGestolen": 0,
        "inwoners": 34930,
        "wagenpark": 18863
      },
      "Hollands Kroon": {
        "aantalGestolen": 0,
        "inwoners": 47681,
        "wagenpark": 25090
      },
      "Hoogeveen": {
        "aantalGestolen": 5,
        "inwoners": 55677,
        "wagenpark": 26815
      },
      "Hoorn": {
        "aantalGestolen": 15,
        "inwoners": 72806,
        "wagenpark": 31678
      },
      "Horst aan de Maas": {
        "aantalGestolen": 3,
        "inwoners": 42271,
        "wagenpark": 23127
      },
      "Houten": {
        "aantalGestolen": 6,
        "inwoners": 49579,
        "wagenpark": 47643
      },
      "Huizen": {
        "aantalGestolen": 5,
        "inwoners": 41369,
        "wagenpark": 21457
      },
      "Hulst": {
        "aantalGestolen": 0,
        "inwoners": 27472,
        "wagenpark": 15599
      },
      "IJsselstein": {
        "aantalGestolen": 0,
        "inwoners": 34302,
        "wagenpark": 15067
      },
      "Kaag en Braassem": {
        "aantalGestolen": 1,
        "inwoners": 26625,
        "wagenpark": 13433
      },
      "Kampen": {
        "aantalGestolen": 1,
        "inwoners": 53259,
        "wagenpark": 21858
      },
      "Kapelle": {
        "aantalGestolen": 0,
        "inwoners": 12720,
        "wagenpark": 6574
      },
      "Katwijk": {
        "aantalGestolen": 3,
        "inwoners": 64956,
        "wagenpark": 25106
      },
      "Kerkrade": {
        "aantalGestolen": 24,
        "inwoners": 45823,
        "wagenpark": 23434
      },
      "Koggenland": {
        "aantalGestolen": 8,
        "inwoners": 22659,
        "wagenpark": 11585
      },
      "Krimpen aan den IJssel": {
        "aantalGestolen": 0,
        "inwoners": 29306,
        "wagenpark": 13077
      },
      "Krimpenerwaard": {
        "aantalGestolen": 2,
        "inwoners": 55644,
        "wagenpark": 26257
      },
      "Laarbeek": {
        "aantalGestolen": 5,
        "inwoners": 22158,
        "wagenpark": 11680
      },
      "Landerd": {
        "aantalGestolen": 3,
        "inwoners": 15332,
        "wagenpark": 8650
      },
      "Landgraaf": {
        "aantalGestolen": 14,
        "inwoners": 37612,
        "wagenpark": 20453
      },
      "Landsmeer": {
        "aantalGestolen": 3,
        "inwoners": 11435,
        "wagenpark": 5474
      },
      "Langedijk": {
        "aantalGestolen": 3,
        "inwoners": 27836,
        "wagenpark": 13795
      },
      "Lansingerland": {
        "aantalGestolen": 19,
        "inwoners": 61155,
        "wagenpark": 29413
      },
      "Laren": {
        "aantalGestolen": 0,
        "inwoners": 11146,
        "wagenpark": 6420
      },
      "Leeuwarden": {
        "aantalGestolen": 13,
        "inwoners": 122415,
        "wagenpark": 44605
      },
      "Leiden": {
        "aantalGestolen": 10,
        "inwoners": 124306,
        "wagenpark": 38936
      },
      "Leiderdorp": {
        "aantalGestolen": 4,
        "inwoners": 27197,
        "wagenpark": 13122
      },
      "Leidschendam-Voorburg": {
        "aantalGestolen": 32,
        "inwoners": 74947,
        "wagenpark": 34915
      },
      "Lelystad": {
        "aantalGestolen": 15,
        "inwoners": 77389,
        "wagenpark": 33245
      },
      "Leudal": {
        "aantalGestolen": 11,
        "inwoners": 35857,
        "wagenpark": 20453
      },
      "Leusden": {
        "aantalGestolen": 1,
        "inwoners": 29755,
        "wagenpark": 14908
      },
      "Lingewaard": {
        "aantalGestolen": 4,
        "inwoners": 46372,
        "wagenpark": 23144
      },
      "Lisse": {
        "aantalGestolen": 4,
        "inwoners": 22746,
        "wagenpark": 11303
      },
      "Lochem": {
        "aantalGestolen": 1,
        "inwoners": 33574,
        "wagenpark": 18626
      },
      "Loon op Zand": {
        "aantalGestolen": 2,
        "inwoners": 23120,
        "wagenpark": 12281
      },
      "Lopik": {
        "aantalGestolen": 0,
        "inwoners": 14395,
        "wagenpark": 7206
      },
      "Loppersum": {
        "aantalGestolen": 0,
        "inwoners": 9732,
        "wagenpark": 5136
      },
      "Losser": {
        "aantalGestolen": 0,
        "inwoners": 22547,
        "wagenpark": 11694
      },
      "Maasdriel": {
        "aantalGestolen": 11,
        "inwoners": 24350,
        "wagenpark": 13227
      },
      "Maasgouw": {
        "aantalGestolen": 3,
        "inwoners": 23697,
        "wagenpark": 13662
      },
      "Maassluis": {
        "aantalGestolen": 8,
        "inwoners": 32518,
        "wagenpark": 14356
      },
      "Maastricht": {
        "aantalGestolen": 47,
        "inwoners": 122723,
        "wagenpark": 45421
      },
      "Medemblik": {
        "aantalGestolen": 6,
        "inwoners": 44480,
        "wagenpark": 22340
      },
      "Meerssen": {
        "aantalGestolen": 9,
        "inwoners": 19039,
        "wagenpark": 10417
      },
      "Meierijstad": {
        "aantalGestolen": 17,
        "inwoners": 80148,
        "wagenpark": 43005
      },
      "Meppel": {
        "aantalGestolen": 4,
        "inwoners": 33410,
        "wagenpark": 15705
      },
      "Middelburg": {
        "aantalGestolen": 2,
        "inwoners": 48303,
        "wagenpark": 21937
      },
      "Midden-Delfland": {
        "aantalGestolen": 5,
        "inwoners": 19338,
        "wagenpark": 8981
      },
      "Midden-Drenthe": {
        "aantalGestolen": 0,
        "inwoners": 33172,
        "wagenpark": 17706
      },
      "Midden-Groningen": {
        "aantalGestolen": 5,
        "inwoners": 60951,
        "wagenpark": 31792
      },
      "Mill en Sint Hubert": {
        "aantalGestolen": 1,
        "inwoners": 10831,
        "wagenpark": 6389
      },
      "Moerdijk": {
        "aantalGestolen": 21,
        "inwoners": 36967,
        "wagenpark": 20448
      },
      "Molenlanden": {
        "aantalGestolen": 3,
        "inwoners": 43846,
        "wagenpark": 22809
      },
      "Montferland": {
        "aantalGestolen": 7,
        "inwoners": 35627,
        "wagenpark": 18717
      },
      "Montfoort": {
        "aantalGestolen": 0,
        "inwoners": 13879,
        "wagenpark": 6680
      },
      "Mook en Middelaar": {
        "aantalGestolen": 0,
        "inwoners": 7768,
        "wagenpark": 4546
      },
      "Neder-Betuwe": {
        "aantalGestolen": 4,
        "inwoners": 23615,
        "wagenpark": 11852
      },
      "Nederweert": {
        "aantalGestolen": 4,
        "inwoners": 17038,
        "wagenpark": 9637
      },
      "Nieuwegein": {
        "aantalGestolen": 14,
        "inwoners": 62426,
        "wagenpark": 28634
      },
      "Nieuwkoop": {
        "aantalGestolen": 4,
        "inwoners": 28269,
        "wagenpark": 15183
      },
      "Nijkerk": {
        "aantalGestolen": 4,
        "inwoners": 42307,
        "wagenpark": 20677
      },
      "Nijmegen": {
        "aantalGestolen": 77,
        "inwoners": 175948,
        "wagenpark": 65514
      },
      "Nissewaard": {
        "aantalGestolen": 17,
        "inwoners": 84588,
        "wagenpark": 39868
      },
      "Noardeast-Fryslân": {
        "aantalGestolen": 1,
        "inwoners": 45287,
        "wagenpark": 23518
      },
      "Noord-Beveland": {
        "aantalGestolen": 0,
        "inwoners": 7314,
        "wagenpark": 4267
      },
      "Noordenveld": {
        "aantalGestolen": 0,
        "inwoners": 32370,
        "wagenpark": 16882
      },
      "Noordoostpolder": {
        "aantalGestolen": 4,
        "inwoners": 46625,
        "wagenpark": 23138
      },
      "Noordwijk": {
        "aantalGestolen": 6,
        "inwoners": 42661,
        "wagenpark": 12697
      },
      "Nuenen, Gerwen en Nederwetten": {
        "aantalGestolen": 6,
        "inwoners": 23019,
        "wagenpark": 12598
      },
      "Nunspeet": {
        "aantalGestolen": 2,
        "inwoners": 27114,
        "wagenpark": 13062
      },
      "Oegstgeest": {
        "aantalGestolen": 0,
        "inwoners": 23887,
        "wagenpark": 10167
      },
      "Oirschot": {
        "aantalGestolen": 3,
        "inwoners": 18558,
        "wagenpark": 10507
      },
      "Oisterwijk": {
        "aantalGestolen": 3,
        "inwoners": 26132,
        "wagenpark": 13567
      },
      "Oldambt": {
        "aantalGestolen": 0,
        "inwoners": 38075,
        "wagenpark": 19458
      },
      "Oldebroek": {
        "aantalGestolen": 0,
        "inwoners": 23504,
        "wagenpark": 11303
      },
      "Oldenzaal": {
        "aantalGestolen": 0,
        "inwoners": 31915,
        "wagenpark": 20343
      },
      "Olst-Wijhe": {
        "aantalGestolen": 1,
        "inwoners": 18023,
        "wagenpark": 9261
      },
      "Ommen": {
        "aantalGestolen": 1,
        "inwoners": 17630,
        "wagenpark": 9384
      },
      "Oost Gelre": {
        "aantalGestolen": 0,
        "inwoners": 29675,
        "wagenpark": 15382
      },
      "Oosterhout": {
        "aantalGestolen": 12,
        "inwoners": 55147,
        "wagenpark": 29073
      },
      "Ooststellingwerf": {
        "aantalGestolen": 1,
        "inwoners": 25459,
        "wagenpark": 13593
      },
      "Oostzaan": {
        "aantalGestolen": 1,
        "inwoners": 9735,
        "wagenpark": 4720
      },
      "Opmeer": {
        "aantalGestolen": 3,
        "inwoners": 11526,
        "wagenpark": 6037
      },
      "Opsterland": {
        "aantalGestolen": 1,
        "inwoners": 29753,
        "wagenpark": 15770
      },
      "Oss": {
        "aantalGestolen": 38,
        "inwoners": 90951,
        "wagenpark": 46033
      },
      "Oude IJsselstreek": {
        "aantalGestolen": 2,
        "inwoners": 39520,
        "wagenpark": 20366
      },
      "Ouder-Amstel": {
        "aantalGestolen": 2,
        "inwoners": 13496,
        "wagenpark": 6268
      },
      "Oudewater": {
        "aantalGestolen": 3,
        "inwoners": 10180,
        "wagenpark": 4975
      },
      "Overbetuwe": {
        "aantalGestolen": 5,
        "inwoners": 47481,
        "wagenpark": 25415
      },
      "Papendrecht": {
        "aantalGestolen": 4,
        "inwoners": 32264,
        "wagenpark": 15370
      },
      "Peel en Maas": {
        "aantalGestolen": 4,
        "inwoners": 43312,
        "wagenpark": 23451
      },
      "Pekela": {
        "aantalGestolen": 0,
        "inwoners": 12245,
        "wagenpark": 6699
      },
      "Pijnacker-Nootdorp": {
        "aantalGestolen": 10,
        "inwoners": 53634,
        "wagenpark": 23100
      },
      "Purmerend": {
        "aantalGestolen": 13,
        "inwoners": 79983,
        "wagenpark": 42438
      },
      "Putten": {
        "aantalGestolen": 0,
        "inwoners": 24313,
        "wagenpark": 12194
      },
      "Raalte": {
        "aantalGestolen": 1,
        "inwoners": 37158,
        "wagenpark": 19012
      },
      "Reimerswaal": {
        "aantalGestolen": 1,
        "inwoners": 22555,
        "wagenpark": 10923
      },
      "Renkum": {
        "aantalGestolen": 4,
        "inwoners": 31338,
        "wagenpark": 15997
      },
      "Renswoude": {
        "aantalGestolen": 1,
        "inwoners": 5175,
        "wagenpark": 2574
      },
      "Reusel-De Mierden": {
        "aantalGestolen": 1,
        "inwoners": 13040,
        "wagenpark": 7186
      },
      "Rheden": {
        "aantalGestolen": 4,
        "inwoners": 43527,
        "wagenpark": 21499
      },
      "Rhenen": {
        "aantalGestolen": 2,
        "inwoners": 19816,
        "wagenpark": 9766
      },
      "Ridderkerk": {
        "aantalGestolen": 17,
        "inwoners": 45789,
        "wagenpark": 22217
      },
      "Rijssen-Holten": {
        "aantalGestolen": 2,
        "inwoners": 38097,
        "wagenpark": 18556
      },
      "Rijswijk": {
        "aantalGestolen": 24,
        "inwoners": 52208,
        "wagenpark": 27818
      },
      "Roerdalen": {
        "aantalGestolen": 3,
        "inwoners": 20728,
        "wagenpark": 11962
      },
      "Roermond": {
        "aantalGestolen": 14,
        "inwoners": 57761,
        "wagenpark": 27896
      },
      "Roosendaal": {
        "aantalGestolen": 65,
        "inwoners": 77000,
        "wagenpark": 38271
      },
      "Rotterdam": {
        "aantalGestolen": 232,
        "inwoners": 638712,
        "wagenpark": 219147
      },
      "Rozendaal": {
        "aantalGestolen": 0,
        "inwoners": 1575,
        "wagenpark": 867
      },
      "Rucphen": {
        "aantalGestolen": 0,
        "inwoners": 22401,
        "wagenpark": 12710
      },
      "Schagen": {
        "aantalGestolen": 5,
        "inwoners": 46379,
        "wagenpark": 23802
      },
      "Scherpenzeel": {
        "aantalGestolen": 0,
        "inwoners": 9751,
        "wagenpark": 4744
      },
      "Schiedam": {
        "aantalGestolen": 33,
        "inwoners": 77907,
        "wagenpark": 29494
      },
      "Schiermonnikoog": {
        "aantalGestolen": 0,
        "inwoners": 932,
        "wagenpark": 328
      },
      "Schouwen-Duiveland": {
        "aantalGestolen": 1,
        "inwoners": 33687,
        "wagenpark": 18404
      },
      "'s-Gravenhage": {
        "aantalGestolen": 246,
        "inwoners": 532561,
        "wagenpark": 190461
      },
      "'s-Hertogenbosch": {
        "aantalGestolen": 50,
        "inwoners": 153434,
        "wagenpark": 77168
      },
      "Simpelveld": {
        "aantalGestolen": 0,
        "inwoners": 10561,
        "wagenpark": 6041
      },
      "Sint Anthonis": {
        "aantalGestolen": 0,
        "inwoners": 11577,
        "wagenpark": 6405
      },
      "Sint-Michielsgestel": {
        "aantalGestolen": 7,
        "inwoners": 28673,
        "wagenpark": 15377
      },
      "Sittard-Geleen": {
        "aantalGestolen": 33,
        "inwoners": 92956,
        "wagenpark": 50423
      },
      "Sliedrecht": {
        "aantalGestolen": 1,
        "inwoners": 25020,
        "wagenpark": 11057
      },
      "Sluis": {
        "aantalGestolen": 1,
        "inwoners": 23526,
        "wagenpark": 13478
      },
      "Smallingerland": {
        "aantalGestolen": 5,
        "inwoners": 55889,
        "wagenpark": 30916
      },
      "Soest": {
        "aantalGestolen": 5,
        "inwoners": 46089,
        "wagenpark": 23186
      },
      "Someren": {
        "aantalGestolen": 2,
        "inwoners": 19120,
        "wagenpark": 10150
      },
      "Son en Breugel": {
        "aantalGestolen": 4,
        "inwoners": 16753,
        "wagenpark": 9133
      },
      "Stadskanaal": {
        "aantalGestolen": 2,
        "inwoners": 32258,
        "wagenpark": 16360
      },
      "Staphorst": {
        "aantalGestolen": 1,
        "inwoners": 16797,
        "wagenpark": 8576
      },
      "Stede Broec": {
        "aantalGestolen": 0,
        "inwoners": 21670,
        "wagenpark": 9373
      },
      "Steenbergen": {
        "aantalGestolen": 7,
        "inwoners": 24781,
        "wagenpark": 12853
      },
      "Steenwijkerland": {
        "aantalGestolen": 2,
        "inwoners": 43768,
        "wagenpark": 22030
      },
      "Stein": {
        "aantalGestolen": 6,
        "inwoners": 24987,
        "wagenpark": 14271
      },
      "Stichtse Vecht": {
        "aantalGestolen": 11,
        "inwoners": 64513,
        "wagenpark": 31748
      },
      "Súdwest-Fryslân": {
        "aantalGestolen": 2,
        "inwoners": 89583,
        "wagenpark": 39490
      },
      "Terneuzen": {
        "aantalGestolen": 4,
        "inwoners": 54440,
        "wagenpark": 29479
      },
      "Terschelling": {
        "aantalGestolen": 0,
        "inwoners": 4906,
        "wagenpark": 2277
      },
      "Texel": {
        "aantalGestolen": 0,
        "inwoners": 13584,
        "wagenpark": 6946
      },
      "Teylingen": {
        "aantalGestolen": 4,
        "inwoners": 36584,
        "wagenpark": 17552
      },
      "Tholen": {
        "aantalGestolen": 2,
        "inwoners": 25583,
        "wagenpark": 12941
      },
      "Tiel": {
        "aantalGestolen": 14,
        "inwoners": 41465,
        "wagenpark": 21977
      },
      "Tilburg": {
        "aantalGestolen": 51,
        "inwoners": 215521,
        "wagenpark": 109374
      },
      "Tubbergen": {
        "aantalGestolen": 0,
        "inwoners": 21213,
        "wagenpark": 12110
      },
      "Twenterand": {
        "aantalGestolen": 2,
        "inwoners": 33903,
        "wagenpark": 17428
      },
      "Tynaarlo": {
        "aantalGestolen": 2,
        "inwoners": 33462,
        "wagenpark": 20678
      },
      "Tytsjerksteradiel": {
        "aantalGestolen": 0,
        "inwoners": 31870,
        "wagenpark": 16435
      },
      "Uden": {
        "aantalGestolen": 8,
        "inwoners": 41725,
        "wagenpark": 23018
      },
      "Uitgeest": {
        "aantalGestolen": 2,
        "inwoners": 13520,
        "wagenpark": 6316
      },
      "Uithoorn": {
        "aantalGestolen": 2,
        "inwoners": 29445,
        "wagenpark": 14438
      },
      "Urk": {
        "aantalGestolen": 1,
        "inwoners": 20524,
        "wagenpark": 6807
      },
      "Utrecht": {
        "aantalGestolen": 76,
        "inwoners": 347483,
        "wagenpark": 129843
      },
      "Utrechtse Heuvelrug": {
        "aantalGestolen": 2,
        "inwoners": 49314,
        "wagenpark": 25885
      },
      "Vaals": {
        "aantalGestolen": 2,
        "inwoners": 9874,
        "wagenpark": 4803
      },
      "Valkenburg aan de Geul": {
        "aantalGestolen": 8,
        "inwoners": 16431,
        "wagenpark": 8813
      },
      "Valkenswaard": {
        "aantalGestolen": 7,
        "inwoners": 30654,
        "wagenpark": 16248
      },
      "Veendam": {
        "aantalGestolen": 17,
        "inwoners": 27508,
        "wagenpark": 14188
      },
      "Veenendaal": {
        "aantalGestolen": 16,
        "inwoners": 64918,
        "wagenpark": 29757
      },
      "Veere": {
        "aantalGestolen": 0,
        "inwoners": 21867,
        "wagenpark": 11587
      },
      "Veldhoven": {
        "aantalGestolen": 6,
        "inwoners": 44925,
        "wagenpark": 22915
      },
      "Velsen": {
        "aantalGestolen": 6,
        "inwoners": 67831,
        "wagenpark": 31511
      },
      "Venlo": {
        "aantalGestolen": 21,
        "inwoners": 101192,
        "wagenpark": 48602
      },
      "Venray": {
        "aantalGestolen": 11,
        "inwoners": 43341,
        "wagenpark": 21836
      },
      "Vijfheerenlanden": {
        "aantalGestolen": 8,
        "inwoners": 55001,
        "wagenpark": 35388
      },
      "Vlaardingen": {
        "aantalGestolen": 19,
        "inwoners": 72050,
        "wagenpark": 29648
      },
      "Vlieland": {
        "aantalGestolen": 0,
        "inwoners": 1132,
        "wagenpark": 381
      },
      "Vlissingen": {
        "aantalGestolen": 0,
        "inwoners": 44485,
        "wagenpark": 20171
      },
      "Voerendaal": {
        "aantalGestolen": 4,
        "inwoners": 12390,
        "wagenpark": 7110
      },
      "Voorschoten": {
        "aantalGestolen": 7,
        "inwoners": 25453,
        "wagenpark": 11400
      },
      "Voorst": {
        "aantalGestolen": 1,
        "inwoners": 24310,
        "wagenpark": 12750
      },
      "Vught": {
        "aantalGestolen": 4,
        "inwoners": 26418,
        "wagenpark": 12489
      },
      "Waadhoeke": {
        "aantalGestolen": 1,
        "inwoners": 46112,
        "wagenpark": 23479
      },
      "Waalre": {
        "aantalGestolen": 2,
        "inwoners": 17075,
        "wagenpark": 9283
      },
      "Waalwijk": {
        "aantalGestolen": 6,
        "inwoners": 47725,
        "wagenpark": 25327
      },
      "Waddinxveen": {
        "aantalGestolen": 5,
        "inwoners": 27578,
        "wagenpark": 13082
      },
      "Wageningen": {
        "aantalGestolen": 1,
        "inwoners": 38412,
        "wagenpark": 12856
      },
      "Wassenaar": {
        "aantalGestolen": 2,
        "inwoners": 26084,
        "wagenpark": 14201
      },
      "Waterland": {
        "aantalGestolen": 0,
        "inwoners": 17259,
        "wagenpark": 7905
      },
      "Weert": {
        "aantalGestolen": 8,
        "inwoners": 49855,
        "wagenpark": 24332
      },
      "Weesp": {
        "aantalGestolen": 0,
        "inwoners": 19147,
        "wagenpark": 7865
      },
      "West Betuwe": {
        "aantalGestolen": 2,
        "inwoners": 50349,
        "wagenpark": 28098
      },
      "West Maas en Waal": {
        "aantalGestolen": 2,
        "inwoners": 18891,
        "wagenpark": 10565
      },
      "Westerkwartier": {
        "aantalGestolen": 0,
        "inwoners": 62844,
        "wagenpark": 33758
      },
      "Westerveld": {
        "aantalGestolen": 1,
        "inwoners": 19152,
        "wagenpark": 10705
      },
      "Westervoort": {
        "aantalGestolen": 5,
        "inwoners": 15015,
        "wagenpark": 7280
      },
      "Westerwolde": {
        "aantalGestolen": 2,
        "inwoners": 24684,
        "wagenpark": 14382
      },
      "Westland": {
        "aantalGestolen": 17,
        "inwoners": 107492,
        "wagenpark": 52482
      },
      "Weststellingwerf": {
        "aantalGestolen": 0,
        "inwoners": 25720,
        "wagenpark": 13430
      },
      "Westvoorne": {
        "aantalGestolen": 3,
        "inwoners": 14508,
        "wagenpark": 8301
      },
      "Wierden": {
        "aantalGestolen": 1,
        "inwoners": 24258,
        "wagenpark": 17631
      },
      "Wijchen": {
        "aantalGestolen": 10,
        "inwoners": 40847,
        "wagenpark": 20879
      },
      "Wijdemeren": {
        "aantalGestolen": 3,
        "inwoners": 23659,
        "wagenpark": 13416
      },
      "Wijk bij Duurstede": {
        "aantalGestolen": 2,
        "inwoners": 23678,
        "wagenpark": 11746
      },
      "Winterswijk": {
        "aantalGestolen": 0,
        "inwoners": 28987,
        "wagenpark": 13931
      },
      "Woensdrecht": {
        "aantalGestolen": 7,
        "inwoners": 21800,
        "wagenpark": 12083
      },
      "Woerden": {
        "aantalGestolen": 1,
        "inwoners": 51758,
        "wagenpark": 23890
      },
      "Wormerland": {
        "aantalGestolen": 2,
        "inwoners": 15995,
        "wagenpark": 7538
      },
      "Woudenberg": {
        "aantalGestolen": 1,
        "inwoners": 13021,
        "wagenpark": 6284
      },
      "Zaanstad": {
        "aantalGestolen": 38,
        "inwoners": 154865,
        "wagenpark": 63450
      },
      "Zaltbommel": {
        "aantalGestolen": 4,
        "inwoners": 28014,
        "wagenpark": 14068
      },
      "Zandvoort": {
        "aantalGestolen": 4,
        "inwoners": 16970,
        "wagenpark": 7656
      },
      "Zeewolde": {
        "aantalGestolen": 2,
        "inwoners": 22407,
        "wagenpark": 14177
      },
      "Zeist": {
        "aantalGestolen": 8,
        "inwoners": 63322,
        "wagenpark": 38235
      },
      "Zevenaar": {
        "aantalGestolen": 5,
        "inwoners": 43402,
        "wagenpark": 16413
      },
      "Zoetermeer": {
        "aantalGestolen": 39,
        "inwoners": 124695,
        "wagenpark": 55871
      },
      "Zoeterwoude": {
        "aantalGestolen": 2,
        "inwoners": 8430,
        "wagenpark": 3937
      },
      "Zuidplas": {
        "aantalGestolen": 7,
        "inwoners": 41882,
        "wagenpark": 20491
      },
      "Zundert": {
        "aantalGestolen": 3,
        "inwoners": 21525,
        "wagenpark": 11920
      },
      "Zutphen": {
        "aantalGestolen": 6,
        "inwoners": 47537,
        "wagenpark": 20364
      },
      "Zwartewaterland": {
        "aantalGestolen": 3,
        "inwoners": 22468,
        "wagenpark": 10558
      },
      "Zwijndrecht": {
        "aantalGestolen": 11,
        "inwoners": 44586,
        "wagenpark": 20872
      },
      "Zwolle": {
        "aantalGestolen": 22,
        "inwoners": 126116,
        "wagenpark": 52255
      }
    };

    for (const gemeente of Object.keys(gestolenPerGemeente)) {
      gestolenPerGemeente[gemeente].gestolenPerInwoners = (gestolenPerGemeente[gemeente].aantalGestolen / gestolenPerGemeente[gemeente].inwoners * 10000).toFixed(2);
      gestolenPerGemeente[gemeente].gestolenPerWagenpark = (gestolenPerGemeente[gemeente].aantalGestolen / gestolenPerGemeente[gemeente].wagenpark * 10000).toFixed(2);
    }

    /* src/components/MapChart.svelte generated by Svelte v3.29.7 */

    const { Object: Object_1$1 } = globals;
    const file$3 = "src/components/MapChart.svelte";

    function create_fragment$3(ctx) {
    	let section;
    	let t;
    	let select_1;
    	let updating_selected;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	function select_1_selected_binding(value) {
    		/*select_1_selected_binding*/ ctx[6].call(null, value);
    	}

    	let select_1_props = {
    		selectionValues: /*selectionValues*/ ctx[0],
    		storageKey: 30753491
    	};

    	if (/*selected*/ ctx[1] !== void 0) {
    		select_1_props.selected = /*selected*/ ctx[1];
    	}

    	select_1 = new Select({ props: select_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(select_1, "selected", select_1_selected_binding));

    	const block = {
    		c: function create() {
    			section = element("section");
    			if (default_slot) default_slot.c();
    			t = space();
    			create_component(select_1.$$.fragment);
    			add_location(section, file$3, 126, 0, 3401);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			if (default_slot) {
    				default_slot.m(section, null);
    			}

    			append_dev(section, t);
    			mount_component(select_1, section, null);
    			/*section_binding*/ ctx[7](section);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}

    			const select_1_changes = {};
    			if (dirty & /*selectionValues*/ 1) select_1_changes.selectionValues = /*selectionValues*/ ctx[0];

    			if (!updating_selected && dirty & /*selected*/ 2) {
    				updating_selected = true;
    				select_1_changes.selected = /*selected*/ ctx[1];
    				add_flush_callback(() => updating_selected = false);
    			}

    			select_1.$set(select_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(select_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(select_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (default_slot) default_slot.d(detaching);
    			destroy_component(select_1);
    			/*section_binding*/ ctx[7](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MapChart", slots, ['default']);
    	let { tooltip } = $$props;
    	let { selectionValues } = $$props;
    	let selected = selectionValues[0].value;
    	let el;
    	let data;

    	// Draw Chart after update
    	afterUpdate(async () => {
    		await getMapData();
    		drawChart();
    	});

    	/*
      Get Map Data & Store in data variable
    */
    	async function getMapData() {
    		const storage = window.sessionStorage;
    		data = JSON.parse(storage.getItem("data-37167725"));

    		if (data === null) {
    			data = await json("https://cartomap.github.io/nl/wgs84/gemeente_2020.topojson");
    			storage.setItem("data-37167725", JSON.stringify(data));
    		}
    	}

    	/*
      Draw Map Chart inside el container using data
    */
    	function drawChart() {
    		// Set variable used to scale the map chart from selection
    		const scaleVar = selected;

    		// Select d3 container element
    		const container = select(el);

    		// Set map chart color
    		const color = "var(--main-color)";

    		// Set map stroke color
    		const strokeColor = "var(--background-color)";

    		// Get highest Number
    		let highestNumber = 0;

    		for (const item of Object.keys(gestolenPerGemeente)) {
    			if (gestolenPerGemeente[item][scaleVar] > highestNumber) highestNumber = gestolenPerGemeente[item][scaleVar];
    		}

    		// Add svg & add responsiveness with viewbox
    		let svg = container.select("svg");

    		if (svg.empty()) {
    			svg = container.append("svg").attr("width", "100%").attr("height", "80vh").attr("viewBox", "488.9 80 10.4 12.3");
    		}

    		// Get geojson features from topojson
    		const geojson = feature(data, data.objects.gemeente_2020).features;

    		// Set projection function (lat/long > x/y)
    		const projection = geoMercator();

    		// Add projection to path generator
    		const pathGenerator = geoPath().projection(projection);

    		// Scale for scaling opacity
    		const opacityScale = linear$1().range([0.1, 1]).domain([0, highestNumber]);

    		// Create group & append paths
    		const gemeentes = svg.selectAll("path").data(geojson);

    		gemeentes.exit().remove();
    		gemeentes.transition().duration(0).attr("opacity", d => opacityScale(gestolenPerGemeente[d.properties.statnaam][scaleVar]));

    		gemeentes.enter().append("path").attr("d", pathGenerator).attr("fill", color).attr("opacity", d => opacityScale(gestolenPerGemeente[d.properties.statnaam][scaleVar])).attr("stroke", strokeColor).attr("stroke-width", "0.01px").on("mousemove", (e, d) => {
    			tooltip.setText(tooltipText(d));
    			tooltip.showTooltip(e);
    		}).on("mouseout", () => tooltip.hideTooltip());

    		/*
      Create Tooltip text
    */
    		function tooltipText(d) {
    			const gemeente = d.properties.statnaam;
    			let value = gestolenPerGemeente[gemeente][scaleVar];

    			if (gestolenPerGemeente[gemeente] !== undefined) {
    				if (typeof value === "number") {
    					value = value.toLocaleString("nl-nl");
    				} else {
    					value = value.replace(".", ",");
    				}
    			} else {
    				value = "data onbekend";
    			}

    			return { table: [[gemeente, value]] };
    		}
    	}

    	const writable_props = ["tooltip", "selectionValues"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MapChart> was created with unknown prop '${key}'`);
    	});

    	function select_1_selected_binding(value) {
    		selected = value;
    		$$invalidate(1, selected);
    	}

    	function section_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			el = $$value;
    			$$invalidate(2, el);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("tooltip" in $$props) $$invalidate(3, tooltip = $$props.tooltip);
    		if ("selectionValues" in $$props) $$invalidate(0, selectionValues = $$props.selectionValues);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Select,
    		Tooltip,
    		onMount,
    		afterUpdate,
    		topojson,
    		select,
    		json,
    		geoMercator,
    		geoPath,
    		scaleLinear: linear$1,
    		gestolenPerGemeente,
    		tooltip,
    		selectionValues,
    		selected,
    		el,
    		data,
    		getMapData,
    		drawChart
    	});

    	$$self.$inject_state = $$props => {
    		if ("tooltip" in $$props) $$invalidate(3, tooltip = $$props.tooltip);
    		if ("selectionValues" in $$props) $$invalidate(0, selectionValues = $$props.selectionValues);
    		if ("selected" in $$props) $$invalidate(1, selected = $$props.selected);
    		if ("el" in $$props) $$invalidate(2, el = $$props.el);
    		if ("data" in $$props) data = $$props.data;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		selectionValues,
    		selected,
    		el,
    		tooltip,
    		$$scope,
    		slots,
    		select_1_selected_binding,
    		section_binding
    	];
    }

    class MapChart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { tooltip: 3, selectionValues: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MapChart",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*tooltip*/ ctx[3] === undefined && !("tooltip" in props)) {
    			console.warn("<MapChart> was created without expected prop 'tooltip'");
    		}

    		if (/*selectionValues*/ ctx[0] === undefined && !("selectionValues" in props)) {
    			console.warn("<MapChart> was created without expected prop 'selectionValues'");
    		}
    	}

    	get tooltip() {
    		throw new Error("<MapChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tooltip(value) {
    		throw new Error("<MapChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectionValues() {
    		throw new Error("<MapChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectionValues(value) {
    		throw new Error("<MapChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Car.svelte generated by Svelte v3.29.7 */

    const file$4 = "src/components/Car.svelte";

    function create_fragment$4(ctx) {
    	let svg;
    	let defs;
    	let style;
    	let t;
    	let g4;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let g0;
    	let circle0;
    	let circle1;
    	let g1;
    	let circle2;
    	let circle3;
    	let path4;
    	let path5;
    	let path6;
    	let path7;
    	let path8;
    	let path9;
    	let path10;
    	let g2;
    	let circle4;
    	let circle5;
    	let g3;
    	let circle6;
    	let circle7;
    	let path11;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			style = svg_element("style");
    			t = text(".a,.b,.c,.d,.e{fill:#fff;}.a,.b,.c,.d{stroke:#12355d;}.a,.d{stroke-width:10px;}.b,.e{stroke-linecap:round;}.b,.d,.e{stroke-linejoin:round;}.b,.c,.e{stroke-width:15px;}.e{stroke:#103462;}.f{stroke:none;}.g{fill:none;}");
    			g4 = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			g0 = svg_element("g");
    			circle0 = svg_element("circle");
    			circle1 = svg_element("circle");
    			g1 = svg_element("g");
    			circle2 = svg_element("circle");
    			circle3 = svg_element("circle");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			path8 = svg_element("path");
    			path9 = svg_element("path");
    			path10 = svg_element("path");
    			g2 = svg_element("g");
    			circle4 = svg_element("circle");
    			circle5 = svg_element("circle");
    			g3 = svg_element("g");
    			circle6 = svg_element("circle");
    			circle7 = svg_element("circle");
    			path11 = svg_element("path");
    			add_location(style, file$4, 6, 77, 129);
    			add_location(defs, file$4, 6, 71, 123);
    			attr_dev(path0, "class", "a");
    			attr_dev(path0, "d", "M166.108,3587.432v-73H260.4v73Z");
    			attr_dev(path0, "transform", "translate(-178.549 -8.973) rotate(-3)");
    			add_location(path0, file$4, 6, 360, 412);
    			attr_dev(path1, "class", "b");
    			attr_dev(path1, "d", "M506.577,3305.439c-66.972-.158-185.051,35.411-219.827,49.938-102.875,42.971-97.6,78.569-104.615,85.055s-23.256,21.795-19.048,73.267c21.589,6.171,65.108,3.148,65.108,3.148s20.99,30.723,27.024,50.464c-70.578,8.949-86.177,15.541-93.11,24.977,32.854,12.725,55.8,17.518,156.946,23.489s1090.744,11.5,1090.744,11.5l138.3-24.812h59.537l59.111-62.314v-98.78h-33.078s-.759-52.489,0-116.862c-33.129-63.118-132.514-135.608-132.514-135.608l21.62-16.182s-194.925-37.266-376.776-37.266-286.725,17.123-350.628,37.266-242.721,132.722-242.721,132.722S537.667,3305.7,506.577,3305.439Z");
    			attr_dev(path1, "transform", "translate(0 -24)");
    			add_location(path1, file$4, 6, 463, 515);
    			attr_dev(path2, "class", "b");
    			attr_dev(path2, "d", "M1163.421,467.322a128.488,128.488,0,1,1,242.193-24.31h-19.62l-138.3,24.811S1216.009,467.647,1163.421,467.322Z");
    			attr_dev(path2, "transform", "translate(162.108 3135.451)");
    			add_location(path2, file$4, 6, 1079, 1131);
    			attr_dev(path3, "class", "b");
    			attr_dev(path3, "d", "M177.309,457.178a128.5,128.5,0,1,1,240.647,4.045C309.288,459.959,220.622,458.588,177.309,457.178Z");
    			attr_dev(path3, "transform", "translate(162.108 3135.451)");
    			add_location(path3, file$4, 6, 1250, 1302);
    			attr_dev(circle0, "class", "f");
    			attr_dev(circle0, "cx", "115.5");
    			attr_dev(circle0, "cy", "115.5");
    			attr_dev(circle0, "r", "115.5");
    			add_location(circle0, file$4, 6, 1454, 1506);
    			attr_dev(circle1, "class", "g");
    			attr_dev(circle1, "cx", "115.5");
    			attr_dev(circle1, "cy", "115.5");
    			attr_dev(circle1, "r", "110.5");
    			add_location(circle1, file$4, 6, 1505, 1557);
    			attr_dev(g0, "class", "a");
    			attr_dev(g0, "transform", "translate(345 3434)");
    			add_location(g0, file$4, 6, 1409, 1461);
    			attr_dev(circle2, "class", "f");
    			attr_dev(circle2, "cx", "115.5");
    			attr_dev(circle2, "cy", "115.5");
    			attr_dev(circle2, "r", "115.5");
    			add_location(circle2, file$4, 6, 1606, 1658);
    			attr_dev(circle3, "class", "g");
    			attr_dev(circle3, "cx", "115.5");
    			attr_dev(circle3, "cy", "115.5");
    			attr_dev(circle3, "r", "110.5");
    			add_location(circle3, file$4, 6, 1657, 1709);
    			attr_dev(g1, "class", "a");
    			attr_dev(g1, "transform", "translate(1327 3434)");
    			add_location(g1, file$4, 6, 1560, 1612);
    			attr_dev(path4, "class", "a");
    			attr_dev(path4, "d", "M641.522,3339.351c-22.669,46.3-11.906,254.873-11.906,254.873l445.49-6.922s51.312-16.711,63.17-193c6.014-70.6-21.39-86.025-21.39-86.025S693.487,3338.539,641.522,3339.351Z");
    			attr_dev(path4, "transform", "translate(0 -24)");
    			add_location(path4, file$4, 6, 1712, 1764);
    			attr_dev(path5, "class", "b");
    			attr_dev(path5, "d", "M601.708,3326.593c8.077-42.893,180.831-119.162,231.019-135.194,100.258-25.615,244.384-28.012,297.732-29.424s233.6,14.544,247.484,20.3,58.048,48.9,80.814,84.153c-79.106,26.826-231.842,32.779-357.422,42.831C885.186,3319.582,596.355,3355.083,601.708,3326.593Z");
    			attr_dev(path5, "transform", "translate(0 -24)");
    			add_location(path5, file$4, 6, 1932, 1984);
    			attr_dev(path6, "class", "a");
    			attr_dev(path6, "d", "M728.25,3237.97v90.6H668.494s-10.694-10.511-11.023-25.527c1.2-16.838,5.2-25.977,37.786-28.845,18.008-.231,22.983,4.173,25.229,5.974a24.131,24.131,0,0,1,7.764,20.215Z");
    			attr_dev(path6, "transform", "translate(0 -24)");
    			add_location(path6, file$4, 6, 2239, 2291);
    			attr_dev(path7, "class", "c");
    			attr_dev(path7, "d", "M1130.57,3163.806l-26.8,141.782");
    			attr_dev(path7, "transform", "translate(0 -24)");
    			add_location(path7, file$4, 6, 2455, 2507);
    			attr_dev(path8, "class", "d");
    			attr_dev(path8, "d", "M1338.4,3146.118l20.961-19.8,21.446,1.938,47.9-43.057-47.9,43.057-5.856,20.3Z");
    			attr_dev(path8, "transform", "translate(0 -24)");
    			add_location(path8, file$4, 6, 2537, 2589);
    			attr_dev(path9, "class", "d");
    			attr_dev(path9, "d", "M1535.383,3319.033c15.322-4.762,47.594-3.825,60.089-3.8,22.017,8.468,24.706,28.363,27.979,37.668.375,37.7.814,45.306-3.2,54.668-17.729,3.869-39.78,1.952-51.085,0C1563.842,3398,1528.805,3342.117,1535.383,3319.033Z");
    			attr_dev(path9, "transform", "translate(0 -24)");
    			add_location(path9, file$4, 6, 2665, 2717);
    			attr_dev(path10, "class", "d");
    			attr_dev(path10, "d", "M187.115,3457.01c3.678-9.435-1.336-50.309,64.177-63.338,30.81-4.728,60.473-6.63,79.24-4.309,9.769,19.056-23.295,46.043-44.8,60.265C250.418,3460.182,199.5,3458.772,187.115,3457.01Z");
    			attr_dev(path10, "transform", "translate(0 -24)");
    			add_location(path10, file$4, 6, 2928, 2980);
    			attr_dev(circle4, "class", "f");
    			attr_dev(circle4, "cx", "86.5");
    			attr_dev(circle4, "cy", "86.5");
    			attr_dev(circle4, "r", "86.5");
    			add_location(circle4, file$4, 6, 3203, 3255);
    			attr_dev(circle5, "class", "g");
    			attr_dev(circle5, "cx", "86.5");
    			attr_dev(circle5, "cy", "86.5");
    			attr_dev(circle5, "r", "81.5");
    			add_location(circle5, file$4, 6, 3251, 3303);
    			attr_dev(g2, "class", "a");
    			attr_dev(g2, "transform", "translate(374 3463)");
    			add_location(g2, file$4, 6, 3158, 3210);
    			attr_dev(circle6, "class", "f");
    			attr_dev(circle6, "cx", "86.5");
    			attr_dev(circle6, "cy", "86.5");
    			attr_dev(circle6, "r", "86.5");
    			add_location(circle6, file$4, 6, 3349, 3401);
    			attr_dev(circle7, "class", "g");
    			attr_dev(circle7, "cx", "86.5");
    			attr_dev(circle7, "cy", "86.5");
    			attr_dev(circle7, "r", "81.5");
    			add_location(circle7, file$4, 6, 3397, 3449);
    			attr_dev(g3, "class", "a");
    			attr_dev(g3, "transform", "translate(1356 3463)");
    			add_location(g3, file$4, 6, 3303, 3355);
    			attr_dev(path11, "class", "e");
    			attr_dev(path11, "d", "M1036.9,3374.993l68.967-3.783");
    			attr_dev(path11, "transform", "translate(0 -24)");
    			add_location(path11, file$4, 6, 3449, 3501);
    			attr_dev(g4, "transform", "translate(-154.608 -3056.196)");
    			add_location(g4, file$4, 6, 315, 367);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 1519.642 608.804");
    			attr_dev(svg, "class", "svelte-s141pz");
    			add_location(svg, file$4, 6, 0, 52);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, defs);
    			append_dev(defs, style);
    			append_dev(style, t);
    			append_dev(svg, g4);
    			append_dev(g4, path0);
    			append_dev(g4, path1);
    			append_dev(g4, path2);
    			append_dev(g4, path3);
    			append_dev(g4, g0);
    			append_dev(g0, circle0);
    			append_dev(g0, circle1);
    			append_dev(g4, g1);
    			append_dev(g1, circle2);
    			append_dev(g1, circle3);
    			append_dev(g4, path4);
    			append_dev(g4, path5);
    			append_dev(g4, path6);
    			append_dev(g4, path7);
    			append_dev(g4, path8);
    			append_dev(g4, path9);
    			append_dev(g4, path10);
    			append_dev(g4, g2);
    			append_dev(g2, circle4);
    			append_dev(g2, circle5);
    			append_dev(g4, g3);
    			append_dev(g3, circle6);
    			append_dev(g3, circle7);
    			append_dev(g4, path11);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Car", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Car> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Car extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Car",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/GraphicChart.svelte generated by Svelte v3.29.7 */
    const file$5 = "src/components/GraphicChart.svelte";

    function create_fragment$5(ctx) {
    	let section;
    	let t;
    	let car;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);
    	car = new Car({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			if (default_slot) default_slot.c();
    			t = space();
    			create_component(car.$$.fragment);
    			add_location(section, file$5, 95, 0, 2227);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			if (default_slot) {
    				default_slot.m(section, null);
    			}

    			append_dev(section, t);
    			mount_component(car, section, null);
    			/*section_binding*/ ctx[4](section);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(car.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(car.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (default_slot) default_slot.d(detaching);
    			destroy_component(car);
    			/*section_binding*/ ctx[4](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function decideColor(d) {
    	switch (d.type) {
    		case "advice":
    			return "var(--succes-color)";
    		case "attack":
    			return "var(--error-color)";
    	}
    }

    /*
      Create Tooltip text
    */
    function tooltipText(d) {
    	return { title: d.title, text: d.text };
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("GraphicChart", slots, ['default']);
    	let { tooltip } = $$props;

    	const data = [
    		{
    			x: 50,
    			y: 40,
    			type: "advice",
    			title: "Alarm",
    			text: "Zorg ervoor dat uw alarm goed werkt om inbrekers af te schikken."
    		},
    		{
    			x: 30,
    			y: 88,
    			type: "attack",
    			title: "Zenders",
    			text: "Zenders worden gebruikt door auto-dieven om te achterhalen wanneer de auto voor lange tijd stil zal staan."
    		}
    	];

    	let el;

    	onMount(async () => {
    		drawChart();
    	});

    	/*
      Draw Graphic Chart inside el container using data
    */
    	function drawChart() {
    		const container = select(el);
    		const car = container.select("svg");
    		const viewBoxX = car.attr("viewBox").split(" ")[2];
    		const viewBoxY = car.attr("viewBox").split(" ")[3];
    		const radius = 30;

    		// Create x scale
    		const xScale = linear$1().range([0, viewBoxX]).domain([0, 100]);

    		// Create y scale
    		const yScale = linear$1().range([0, viewBoxY]).domain([0, 100]);

    		const point = car.selectAll(".point").data(data).enter().append("g").attr("class", "point").on("mousemove", (e, d) => {
    			tooltip.setText(tooltipText(d));
    			tooltip.showTooltip(e);
    		}).on("mouseout", () => tooltip.hideTooltip());

    		const pointCircle = point.append("circle").attr("r", radius).attr("cx", d => xScale(d.x)).attr("cy", d => yScale(d.y)).style("fill", d => decideColor(d)).style("stroke", d => decideColor(d)).style("stroke-width", 15).style("fill-opacity", 0.5).on("mouseover", (e, d) => {
    			select(e.target).transition().style("fill-opacity", 0.9).attr("r", radius + 5);
    		}).on("mouseout", (e, d) => {
    			select(e.target).transition().style("fill-opacity", 0.5).attr("r", radius);
    		});
    	}

    	const writable_props = ["tooltip"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GraphicChart> was created with unknown prop '${key}'`);
    	});

    	function section_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("tooltip" in $$props) $$invalidate(1, tooltip = $$props.tooltip);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Car,
    		relativeSize,
    		onMount,
    		select,
    		scaleLinear: linear$1,
    		tooltip,
    		data,
    		el,
    		drawChart,
    		decideColor,
    		tooltipText
    	});

    	$$self.$inject_state = $$props => {
    		if ("tooltip" in $$props) $$invalidate(1, tooltip = $$props.tooltip);
    		if ("el" in $$props) $$invalidate(0, el = $$props.el);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [el, tooltip, $$scope, slots, section_binding];
    }

    class GraphicChart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { tooltip: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GraphicChart",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*tooltip*/ ctx[1] === undefined && !("tooltip" in props)) {
    			console.warn("<GraphicChart> was created without expected prop 'tooltip'");
    		}
    	}

    	get tooltip() {
    		throw new Error("<GraphicChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tooltip(value) {
    		throw new Error("<GraphicChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Info.svelte generated by Svelte v3.29.7 */

    const file$6 = "src/components/Info.svelte";

    function create_fragment$6(ctx) {
    	let p;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			p = element("p");
    			if (default_slot) default_slot.c();
    			attr_dev(p, "class", "info svelte-18tlo0q");
    			add_location(p, file$6, 24, 0, 385);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);

    			if (default_slot) {
    				default_slot.m(p, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Info", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Info> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Info extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Info",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.29.7 */
    const file$7 = "src/App.svelte";

    // (41:2) <Info>
    function create_default_slot_4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Data van het LIV over voertuigdiefstal in 2019.");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(41:2) <Info>",
    		ctx
    	});

    	return block;
    }

    // (35:1) <BarChart tooltip={tooltip} selectionValues={barChartSelectionValues} options={barChartOptions} titleVar={"merk"}>
    function create_default_slot_3(ctx) {
    	let h2;
    	let t1;
    	let p;
    	let t3;
    	let info;
    	let current;

    	info = new Info({
    			props: {
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Wat voor auto’s worden het meest gestolen?";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Onderstaande grafiek geeft automerken aan die naar verhouding het meest gestolen worden.\n\t\t\tEr kan ook gefilterd worden op alleen autotypes.";
    			t3 = space();
    			create_component(info.$$.fragment);
    			add_location(h2, file$7, 35, 2, 1243);
    			add_location(p, file$7, 36, 2, 1297);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(info, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const info_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				info_changes.$$scope = { dirty, ctx };
    			}

    			info.$set(info_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(info.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t3);
    			destroy_component(info, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(35:1) <BarChart tooltip={tooltip} selectionValues={barChartSelectionValues} options={barChartOptions} titleVar={\\\"merk\\\"}>",
    		ctx
    	});

    	return block;
    }

    // (50:2) <Info>
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Data van het LIV, CBS & regioatlas.nl respectievelijk over voertuigdiefstal, wagenpark & inwoners in 2019.");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(50:2) <Info>",
    		ctx
    	});

    	return block;
    }

    // (45:1) <MapChart tooltip={tooltip} selectionValues={mapChartSelectionValues}>
    function create_default_slot_1(ctx) {
    	let h2;
    	let t1;
    	let p;
    	let t3;
    	let info;
    	let current;

    	info = new Info({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Waar worden de meeste auto’s gestolen?";
    			t1 = space();
    			p = element("p");
    			p.textContent = "De kaart hieronder geeft een beeld van de verschillende verhoudingen tussen het aantal gestolen auto's en de inwoners/wagenpark per gemeente.";
    			t3 = space();
    			create_component(info.$$.fragment);
    			add_location(h2, file$7, 45, 2, 1609);
    			add_location(p, file$7, 46, 2, 1659);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(info, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const info_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				info_changes.$$scope = { dirty, ctx };
    			}

    			info.$set(info_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(info.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t3);
    			destroy_component(info, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(45:1) <MapChart tooltip={tooltip} selectionValues={mapChartSelectionValues}>",
    		ctx
    	});

    	return block;
    }

    // (54:1) <GraphicChart tooltip={tooltip}>
    function create_default_slot(ctx) {
    	let h2;
    	let t1;
    	let p;
    	let t2;
    	let span0;
    	let t4;
    	let span1;
    	let t6;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Hoe worden auto’s gestolen?";
    			t1 = space();
    			p = element("p");
    			t2 = text("Onderstaand overzicht laat zien hoe auto’s gestolen worden: ");
    			span0 = element("span");
    			span0.textContent = "●";
    			t4 = text("\n\t\t\ten wat je eraan kan doen: ");
    			span1 = element("span");
    			span1.textContent = "●";
    			t6 = text(".\n\t\t\tBeweeg de muis naar de rondjes toe om meer informatie te zien.");
    			add_location(h2, file$7, 54, 2, 1993);
    			set_style(span0, "color", "var(--error-color)");
    			add_location(span0, file$7, 56, 63, 2099);
    			set_style(span1, "color", "var(--succes-color)");
    			add_location(span1, file$7, 57, 29, 2177);
    			add_location(p, file$7, 55, 2, 2032);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t2);
    			append_dev(p, span0);
    			append_dev(p, t4);
    			append_dev(p, span1);
    			append_dev(p, t6);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(54:1) <GraphicChart tooltip={tooltip}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let header;
    	let h1;
    	let t1;
    	let main;
    	let tooltip_1;
    	let t2;
    	let barchart;
    	let t3;
    	let mapchart;
    	let t4;
    	let graphicchart;
    	let t5;
    	let footer;
    	let section;
    	let p;
    	let t7;
    	let a;
    	let current;
    	let tooltip_1_props = {};
    	tooltip_1 = new Tooltip({ props: tooltip_1_props, $$inline: true });
    	/*tooltip_1_binding*/ ctx[4](tooltip_1);

    	barchart = new BarChart({
    			props: {
    				tooltip: /*tooltip*/ ctx[0],
    				selectionValues: /*barChartSelectionValues*/ ctx[1],
    				options: /*barChartOptions*/ ctx[2],
    				titleVar: "merk",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	mapchart = new MapChart({
    			props: {
    				tooltip: /*tooltip*/ ctx[0],
    				selectionValues: /*mapChartSelectionValues*/ ctx[3],
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	graphicchart = new GraphicChart({
    			props: {
    				tooltip: /*tooltip*/ ctx[0],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			h1.textContent = "Hoe kan je ervoor zorgen dat je auto niet gestolen wordt?";
    			t1 = space();
    			main = element("main");
    			create_component(tooltip_1.$$.fragment);
    			t2 = space();
    			create_component(barchart.$$.fragment);
    			t3 = space();
    			create_component(mapchart.$$.fragment);
    			t4 = space();
    			create_component(graphicchart.$$.fragment);
    			t5 = space();
    			footer = element("footer");
    			section = element("section");
    			p = element("p");
    			p.textContent = "Gemaakt door Sjors Wijsman";
    			t7 = space();
    			a = element("a");
    			a.textContent = "Github link";
    			add_location(h1, file$7, 30, 1, 1009);
    			add_location(header, file$7, 29, 0, 999);
    			add_location(main, file$7, 32, 0, 1086);
    			add_location(p, file$7, 64, 2, 2348);
    			attr_dev(a, "href", "https://github.com/SjorsWijsman/frontend-data");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$7, 65, 2, 2384);
    			add_location(section, file$7, 63, 1, 2336);
    			add_location(footer, file$7, 62, 0, 2326);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(tooltip_1, main, null);
    			append_dev(main, t2);
    			mount_component(barchart, main, null);
    			append_dev(main, t3);
    			mount_component(mapchart, main, null);
    			append_dev(main, t4);
    			mount_component(graphicchart, main, null);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, footer, anchor);
    			append_dev(footer, section);
    			append_dev(section, p);
    			append_dev(section, t7);
    			append_dev(section, a);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tooltip_1_changes = {};
    			tooltip_1.$set(tooltip_1_changes);
    			const barchart_changes = {};
    			if (dirty & /*tooltip*/ 1) barchart_changes.tooltip = /*tooltip*/ ctx[0];

    			if (dirty & /*$$scope*/ 32) {
    				barchart_changes.$$scope = { dirty, ctx };
    			}

    			barchart.$set(barchart_changes);
    			const mapchart_changes = {};
    			if (dirty & /*tooltip*/ 1) mapchart_changes.tooltip = /*tooltip*/ ctx[0];

    			if (dirty & /*$$scope*/ 32) {
    				mapchart_changes.$$scope = { dirty, ctx };
    			}

    			mapchart.$set(mapchart_changes);
    			const graphicchart_changes = {};
    			if (dirty & /*tooltip*/ 1) graphicchart_changes.tooltip = /*tooltip*/ ctx[0];

    			if (dirty & /*$$scope*/ 32) {
    				graphicchart_changes.$$scope = { dirty, ctx };
    			}

    			graphicchart.$set(graphicchart_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tooltip_1.$$.fragment, local);
    			transition_in(barchart.$$.fragment, local);
    			transition_in(mapchart.$$.fragment, local);
    			transition_in(graphicchart.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tooltip_1.$$.fragment, local);
    			transition_out(barchart.$$.fragment, local);
    			transition_out(mapchart.$$.fragment, local);
    			transition_out(graphicchart.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(main);
    			/*tooltip_1_binding*/ ctx[4](null);
    			destroy_component(tooltip_1);
    			destroy_component(barchart);
    			destroy_component(mapchart);
    			destroy_component(graphicchart);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let tooltip;

    	const barChartSelectionValues = [
    		{
    			value: "merk gestolen",
    			text: "Merken - Aantal Gestolen"
    		},
    		{
    			value: "merk diefstalrisico",
    			text: "Merken - Diefstalrisico 1 op..."
    		},
    		{
    			value: "type gestolen",
    			text: "Types - Aantal Gestolen"
    		},
    		{
    			value: "type diefstalrisico",
    			text: "Types - Diefstalrisico 1 op..."
    		}
    	];

    	const barChartOptions = { displayAmount: 10 };

    	const mapChartSelectionValues = [
    		{
    			value: "gestolenPerWagenpark",
    			text: "Auto's Gestolen per 10.000 Auto's"
    		},
    		{
    			value: "gestolenPerInwoners",
    			text: "Auto's Gestolen per 10.000 Inwoners"
    		},
    		{
    			value: "aantalGestolen",
    			text: "Totaal Aantal Auto's Gestolen"
    		},
    		{
    			value: "inwoners",
    			text: "Aantal Inwoners"
    		},
    		{ value: "wagenpark", text: "Wagenpark" }
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function tooltip_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			tooltip = $$value;
    			$$invalidate(0, tooltip);
    		});
    	}

    	$$self.$capture_state = () => ({
    		BarChart,
    		MapChart,
    		GraphicChart,
    		Info,
    		Tooltip,
    		tooltip,
    		barChartSelectionValues,
    		barChartOptions,
    		mapChartSelectionValues
    	});

    	$$self.$inject_state = $$props => {
    		if ("tooltip" in $$props) $$invalidate(0, tooltip = $$props.tooltip);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		tooltip,
    		barChartSelectionValues,
    		barChartOptions,
    		mapChartSelectionValues,
    		tooltip_1_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
