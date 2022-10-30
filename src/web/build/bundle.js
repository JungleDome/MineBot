
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
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
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
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
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
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
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }
    class HtmlTag {
        constructor(is_svg = false) {
            this.is_svg = false;
            this.is_svg = is_svg;
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                if (this.is_svg)
                    this.e = svg_element(target.nodeName);
                else
                    this.e = element(target.nodeName);
                this.t = target;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
        });
    }

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
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
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
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
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
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
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_outro_and_destroy_block(block, lookup) {
        block.f();
        outro_and_destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.52.0' }, detail), { bubbles: true }));
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
    function construct_svelte_component_dev(component, props) {
        const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
        try {
            const instance = new component(props);
            if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
                throw new Error(error_message);
            }
            return instance;
        }
        catch (err) {
            const { message } = err;
            if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
                throw new Error(error_message);
            }
            else {
                throw err;
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
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

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    function flip(node, { from, to }, params = {}) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const [ox, oy] = style.transformOrigin.split(' ').map(parseFloat);
        const dx = (from.left + from.width * ox / to.width) - (to.left + ox);
        const dy = (from.top + from.height * oy / to.height) - (to.top + oy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(Math.sqrt(dx * dx + dy * dy)) : duration,
            easing,
            css: (t, u) => {
                const x = u * dx;
                const y = u * dy;
                const sx = t + u * from.width / to.width;
                const sy = t + u * from.height / to.height;
                return `transform: ${transform} translate(${x}px, ${y}px) scale(${sx}, ${sy});`;
            }
        };
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const defaults = {
      duration: 4000,
      initial: 1,
      next: 0,
      pausable: false,
      dismissable: true,
      reversed: false,
      intro: { x: 256 }
    };

    const createToast = () => {
      const { subscribe, update } = writable([]);
      let count = 0;
      const options = {};
      const _obj = (obj) => obj instanceof Object;
      const push = (msg, opts = {}) => {
        const param = { target: 'default', ...(_obj(msg) ? msg : { ...opts, msg }) };
        const conf = options[param.target] || {};
        const entry = {
          ...defaults,
          ...conf,
          ...param,
          theme: { ...conf.theme, ...param.theme },
          classes: [...(conf.classes || []), ...(param.classes || [])],
          id: ++count
        };
        update((n) => (entry.reversed ? [...n, entry] : [entry, ...n]));
        return count
      };
      const pop = (id) => {
        update((n) => {
          if (!n.length || id === 0) return []
          if (_obj(id)) return n.filter((i) => id(i))
          const target = id || Math.max(...n.map((i) => i.id));
          return n.filter((i) => i.id !== target)
        });
      };
      const set = (id, opts = {}) => {
        const param = _obj(id) ? { ...id } : { ...opts, id };
        update((n) => {
          const idx = n.findIndex((i) => i.id === param.id);
          if (idx > -1) {
            n[idx] = { ...n[idx], ...param };
          }
          return n
        });
      };
      const _init = (target = 'default', opts = {}) => {
        options[target] = opts;
        return options
      };
      return { subscribe, push, pop, set, _init }
    };

    const toast = createToast();

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            if (duration === 0) {
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                store.set(value = target_value);
                return Promise.resolve();
            }
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    /* node_modules\@zerodevx\svelte-toast\src\ToastItem.svelte generated by Svelte v3.52.0 */
    const file$2 = "node_modules\\@zerodevx\\svelte-toast\\src\\ToastItem.svelte";

    // (83:4) {:else}
    function create_else_block$1(ctx) {
    	let html_tag;
    	let raw_value = /*item*/ ctx[0].msg + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_tag = new HtmlTag(false);
    			html_anchor = empty();
    			html_tag.a = html_anchor;
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*item*/ 1 && raw_value !== (raw_value = /*item*/ ctx[0].msg + "")) html_tag.p(raw_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(83:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (81:4) {#if item.component}
    function create_if_block_1$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*componentProps*/ ctx[2]];
    	var switch_value = /*item*/ ctx[0].component.src;

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentProps*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*componentProps*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*item*/ ctx[0].component.src)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(81:4) {#if item.component}",
    		ctx
    	});

    	return block;
    }

    // (87:2) {#if item.dismissable}
    function create_if_block$1(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "_toastBtn pe svelte-3w6ih");
    			attr_dev(div, "role", "button");
    			attr_dev(div, "tabindex", "0");
    			add_location(div, file$2, 87, 4, 2167);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "click", /*close*/ ctx[4], false, false, false),
    					listen_dev(div, "keydown", /*keydown_handler*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(87:2) {#if item.dismissable}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let current_block_type_index;
    	let if_block0;
    	let t0;
    	let t1;
    	let progress_1;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_1$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[0].component) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*item*/ ctx[0].dismissable && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			progress_1 = element("progress");
    			attr_dev(div0, "role", "status");
    			attr_dev(div0, "class", "_toastMsg svelte-3w6ih");
    			toggle_class(div0, "pe", /*item*/ ctx[0].component);
    			add_location(div0, file$2, 79, 2, 1922);
    			attr_dev(progress_1, "class", "_toastBar svelte-3w6ih");
    			progress_1.value = /*$progress*/ ctx[1];
    			add_location(progress_1, file$2, 97, 2, 2396);
    			attr_dev(div1, "class", "_toastItem svelte-3w6ih");
    			toggle_class(div1, "pe", /*item*/ ctx[0].pausable);
    			add_location(div1, file$2, 71, 0, 1779);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if_blocks[current_block_type_index].m(div0, null);
    			append_dev(div1, t0);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, progress_1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "mouseenter", /*mouseenter_handler*/ ctx[9], false, false, false),
    					listen_dev(div1, "mouseleave", /*resume*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(div0, null);
    			}

    			if (!current || dirty & /*item*/ 1) {
    				toggle_class(div0, "pe", /*item*/ ctx[0].component);
    			}

    			if (/*item*/ ctx[0].dismissable) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(div1, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!current || dirty & /*$progress*/ 2) {
    				prop_dev(progress_1, "value", /*$progress*/ ctx[1]);
    			}

    			if (!current || dirty & /*item*/ 1) {
    				toggle_class(div1, "pe", /*item*/ ctx[0].pausable);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_blocks[current_block_type_index].d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
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
    	let $progress;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ToastItem', slots, []);
    	let { item } = $$props;
    	const progress = tweened(item.initial, { duration: item.duration, easing: identity });
    	validate_store(progress, 'progress');
    	component_subscribe($$self, progress, value => $$invalidate(1, $progress = value));
    	const close = () => toast.pop(item.id);

    	const autoclose = () => {
    		if ($progress === 1 || $progress === 0) {
    			close();
    		}
    	};

    	let next = item.initial;
    	let prev = next;
    	let paused = false;

    	const pause = () => {
    		if (!paused && $progress !== next) {
    			progress.set($progress, { duration: 0 });
    			paused = true;
    		}
    	};

    	const resume = () => {
    		if (paused) {
    			const d = item.duration;
    			const duration = d - d * (($progress - prev) / (next - prev));
    			progress.set(next, { duration }).then(autoclose);
    			paused = false;
    		}
    	};

    	let componentProps = {};
    	const handler = () => document.hidden ? pause() : resume();

    	const listener = add => {
    		const { hidden, addEventListener, removeEventListener } = document;
    		if (typeof hidden === 'undefined') return;
    		const name = 'visibilitychange';

    		add
    		? addEventListener(name, handler)
    		: removeEventListener(name, handler);

    		return true;
    	};

    	onMount(() => listener(true) && handler());

    	onDestroy(() => {
    		if (typeof item.onpop === 'function') {
    			item.onpop(item.id);
    		}

    		listener(false);
    	});

    	$$self.$$.on_mount.push(function () {
    		if (item === undefined && !('item' in $$props || $$self.$$.bound[$$self.$$.props['item']])) {
    			console.warn("<ToastItem> was created without expected prop 'item'");
    		}
    	});

    	const writable_props = ['item'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ToastItem> was created with unknown prop '${key}'`);
    	});

    	const keydown_handler = e => {
    		if (e instanceof KeyboardEvent && ['Enter', ' '].includes(e.key)) close();
    	};

    	const mouseenter_handler = () => {
    		if (item.pausable) pause();
    	};

    	$$self.$$set = $$props => {
    		if ('item' in $$props) $$invalidate(0, item = $$props.item);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		tweened,
    		linear: identity,
    		toast,
    		item,
    		progress,
    		close,
    		autoclose,
    		next,
    		prev,
    		paused,
    		pause,
    		resume,
    		componentProps,
    		handler,
    		listener,
    		$progress
    	});

    	$$self.$inject_state = $$props => {
    		if ('item' in $$props) $$invalidate(0, item = $$props.item);
    		if ('next' in $$props) $$invalidate(7, next = $$props.next);
    		if ('prev' in $$props) prev = $$props.prev;
    		if ('paused' in $$props) paused = $$props.paused;
    		if ('componentProps' in $$props) $$invalidate(2, componentProps = $$props.componentProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*item*/ 1) {
    			// `progress` has been renamed to `next`; shim included for backward compatibility, to remove in next major
    			if (typeof item.progress !== 'undefined') {
    				$$invalidate(0, item.next = item.progress, item);
    			}
    		}

    		if ($$self.$$.dirty & /*next, item, $progress*/ 131) {
    			if (next !== item.next) {
    				$$invalidate(7, next = item.next);
    				prev = $progress;
    				paused = false;
    				progress.set(next).then(autoclose);
    			}
    		}

    		if ($$self.$$.dirty & /*item*/ 1) {
    			if (item.component) {
    				const { props = {}, sendIdTo } = item.component;

    				$$invalidate(2, componentProps = {
    					...props,
    					...sendIdTo && { [sendIdTo]: item.id }
    				});
    			}
    		}
    	};

    	return [
    		item,
    		$progress,
    		componentProps,
    		progress,
    		close,
    		pause,
    		resume,
    		next,
    		keydown_handler,
    		mouseenter_handler
    	];
    }

    class ToastItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { item: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToastItem",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get item() {
    		throw new Error("<ToastItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<ToastItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@zerodevx\svelte-toast\src\SvelteToast.svelte generated by Svelte v3.52.0 */

    const { Object: Object_1 } = globals;
    const file$1 = "node_modules\\@zerodevx\\svelte-toast\\src\\SvelteToast.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (19:2) {#each items as item (item.id)}
    function create_each_block$1(key_1, ctx) {
    	let li;
    	let toastitem;
    	let t;
    	let li_class_value;
    	let li_style_value;
    	let li_intro;
    	let li_outro;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	toastitem = new ToastItem({
    			props: { item: /*item*/ ctx[5] },
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			create_component(toastitem.$$.fragment);
    			t = space();
    			attr_dev(li, "class", li_class_value = "" + (null_to_empty(/*item*/ ctx[5].classes.join(' ')) + " svelte-1u812xz"));
    			attr_dev(li, "style", li_style_value = /*getCss*/ ctx[1](/*item*/ ctx[5].theme));
    			add_location(li, file$1, 19, 4, 494);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(toastitem, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const toastitem_changes = {};
    			if (dirty & /*items*/ 1) toastitem_changes.item = /*item*/ ctx[5];
    			toastitem.$set(toastitem_changes);

    			if (!current || dirty & /*items*/ 1 && li_class_value !== (li_class_value = "" + (null_to_empty(/*item*/ ctx[5].classes.join(' ')) + " svelte-1u812xz"))) {
    				attr_dev(li, "class", li_class_value);
    			}

    			if (!current || dirty & /*items*/ 1 && li_style_value !== (li_style_value = /*getCss*/ ctx[1](/*item*/ ctx[5].theme))) {
    				attr_dev(li, "style", li_style_value);
    			}
    		},
    		r: function measure() {
    			rect = li.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(li);
    			stop_animation();
    			add_transform(li, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(li, rect, flip, { duration: 200 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toastitem.$$.fragment, local);

    			add_render_callback(() => {
    				if (li_outro) li_outro.end(1);
    				li_intro = create_in_transition(li, fly, /*item*/ ctx[5].intro);
    				li_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toastitem.$$.fragment, local);
    			if (li_intro) li_intro.invalidate();
    			li_outro = create_out_transition(li, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(toastitem);
    			if (detaching && li_outro) li_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(19:2) {#each items as item (item.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*items*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*item*/ ctx[5].id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "_toastContainer svelte-1u812xz");
    			add_location(ul, file$1, 17, 0, 427);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*items, getCss*/ 3) {
    				each_value = /*items*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, fix_and_outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
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
    	let $toast;
    	validate_store(toast, 'toast');
    	component_subscribe($$self, toast, $$value => $$invalidate(4, $toast = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SvelteToast', slots, []);
    	let { options = {} } = $$props;
    	let { target = 'default' } = $$props;
    	let items;
    	const getCss = theme => Object.keys(theme).reduce((a, c) => `${a}${c}:${theme[c]};`, '');
    	const writable_props = ['options', 'target'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SvelteToast> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('options' in $$props) $$invalidate(2, options = $$props.options);
    		if ('target' in $$props) $$invalidate(3, target = $$props.target);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		fly,
    		flip,
    		toast,
    		ToastItem,
    		options,
    		target,
    		items,
    		getCss,
    		$toast
    	});

    	$$self.$inject_state = $$props => {
    		if ('options' in $$props) $$invalidate(2, options = $$props.options);
    		if ('target' in $$props) $$invalidate(3, target = $$props.target);
    		if ('items' in $$props) $$invalidate(0, items = $$props.items);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*target, options*/ 12) {
    			toast._init(target, options);
    		}

    		if ($$self.$$.dirty & /*$toast, target*/ 24) {
    			$$invalidate(0, items = $toast.filter(i => i.target === target));
    		}
    	};

    	return [items, getCss, options, target, $toast];
    }

    class SvelteToast extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { options: 2, target: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SvelteToast",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get options() {
    		throw new Error("<SvelteToast>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<SvelteToast>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get target() {
    		throw new Error("<SvelteToast>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set target(value) {
    		throw new Error("<SvelteToast>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Tailwind.svelte generated by Svelte v3.52.0 */

    function create_fragment$1(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
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

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tailwind', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tailwind> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Tailwind extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tailwind",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    const success = m => toast.push(m, {
        theme: {
            '--toastBackground': 'mintcream',
            '--toastColor': 'rgba(72,187,120,0.9)',
            '--toastBarBackground': '#2F855A'
        }
    });

    const warn = m => toast.push(m, {
        theme: {
            '--toastBackground': 'orange',
            '--toastColor': 'white',
            '--toastBarBackground': 'olive'
        } });

    const error = m => toast.push(m, {
        theme: {
            '--toastBackground': 'rgba(239, 68, 68, 0.9)',
            '--toastColor': 'white',
            '--toastBarBackground': '#fecaca',
        } });

    /* src\App.svelte generated by Svelte v3.52.0 */
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i].timestamp;
    	child_ctx[26] = list[i].message;
    	child_ctx[28] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i].timestamp;
    	child_ctx[26] = list[i].message;
    	child_ctx[28] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[30] = list[i].id;
    	child_ctx[31] = list[i].username;
    	child_ctx[32] = list[i].server;
    	child_ctx[33] = list[i].status;
    	child_ctx[28] = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[31] = list[i].username;
    	child_ctx[28] = i;
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[36] = list[i].host;
    	child_ctx[37] = list[i].port;
    	child_ctx[38] = list[i].cracked;
    	child_ctx[28] = i;
    	return child_ctx;
    }

    // (134:6) {#each serverConfig.servers as { host, port, cracked }
    function create_each_block_4(ctx) {
    	let option;
    	let t0_value = /*host*/ ctx[36] + "";
    	let t0;
    	let t1;
    	let t2_value = /*port*/ ctx[37] + "";
    	let t2;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = text(":");
    			t2 = text(t2_value);
    			option.__value = /*i*/ ctx[28];
    			option.value = option.__value;
    			add_location(option, file, 134, 6, 3868);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    			append_dev(option, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*serverConfig*/ 4 && t0_value !== (t0_value = /*host*/ ctx[36] + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*serverConfig*/ 4 && t2_value !== (t2_value = /*port*/ ctx[37] + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(134:6) {#each serverConfig.servers as { host, port, cracked }",
    		ctx
    	});

    	return block;
    }

    // (154:6) {#each serverConfig.bots as { username }
    function create_each_block_3(ctx) {
    	let option;
    	let t_value = /*username*/ ctx[31] + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*i*/ ctx[28];
    			option.value = option.__value;
    			add_location(option, file, 154, 6, 4804);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*serverConfig*/ 4 && t_value !== (t_value = /*username*/ ctx[31] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(154:6) {#each serverConfig.bots as { username }",
    		ctx
    	});

    	return block;
    }

    // (178:2) {:else}
    function create_else_block_2(ctx) {
    	let each_1_anchor;
    	let each_value_2 = /*bots*/ ctx[3];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*bots, selectedBotItem*/ 72) {
    				each_value_2 = /*bots*/ ctx[3];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(178:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (173:2) {#if bots.length == 0}
    function create_if_block_2(ctx) {
    	let div;
    	let p0;
    	let t1;
    	let p1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			p0.textContent = "No bots yet.";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "Perharps create one?";
    			add_location(p0, file, 174, 3, 5546);
    			add_location(p1, file, 175, 3, 5569);
    			attr_dev(div, "class", "minebot-bot-item svelte-1pkwv9p");
    			add_location(div, file, 173, 2, 5512);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(div, t1);
    			append_dev(div, p1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(173:2) {#if bots.length == 0}",
    		ctx
    	});

    	return block;
    }

    // (179:2) {#each bots as { id,username,server,status }
    function create_each_block_2(ctx) {
    	let div;
    	let span;
    	let t0;
    	let span_title_value;
    	let span_class_value;
    	let t1;
    	let h6;
    	let t2_value = /*username*/ ctx[31] + "";
    	let t2;
    	let t3;
    	let p;
    	let t4_value = /*server*/ ctx[32].host + "";
    	let t4;
    	let t5;
    	let t6_value = /*server*/ ctx[32].port + "";
    	let t6;
    	let t7;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[16](/*id*/ ctx[30], /*username*/ ctx[31], /*server*/ ctx[32], /*status*/ ctx[33]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = text("⬤");
    			t1 = space();
    			h6 = element("h6");
    			t2 = text(t2_value);
    			t3 = space();
    			p = element("p");
    			t4 = text(t4_value);
    			t5 = text(":");
    			t6 = text(t6_value);
    			t7 = space();
    			attr_dev(span, "title", span_title_value = /*status*/ ctx[33]);

    			attr_dev(span, "class", span_class_value = "float-right " + (/*status*/ ctx[33] == 'Normal'
    			? 'text-green-500'
    			: /*status*/ ctx[33] == 'Kicked'
    				? 'text-orange-600'
    				: 'text-rose-600'));

    			add_location(span, file, 180, 3, 5847);
    			attr_dev(h6, "class", "font-bold");
    			add_location(h6, file, 182, 3, 6003);
    			add_location(p, file, 183, 3, 6044);
    			attr_dev(div, "class", "minebot-bot-item cursor-pointer svelte-1pkwv9p");
    			toggle_class(div, "selected", /*id*/ ctx[30] == /*selectedBotItem*/ ctx[6]?.id);
    			add_location(div, file, 179, 2, 5669);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(div, t1);
    			append_dev(div, h6);
    			append_dev(h6, t2);
    			append_dev(div, t3);
    			append_dev(div, p);
    			append_dev(p, t4);
    			append_dev(p, t5);
    			append_dev(p, t6);
    			append_dev(div, t7);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "click", click_handler, false, false, false),
    					listen_dev(div, "keydown", keydown_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*bots*/ 8 && span_title_value !== (span_title_value = /*status*/ ctx[33])) {
    				attr_dev(span, "title", span_title_value);
    			}

    			if (dirty[0] & /*bots*/ 8 && span_class_value !== (span_class_value = "float-right " + (/*status*/ ctx[33] == 'Normal'
    			? 'text-green-500'
    			: /*status*/ ctx[33] == 'Kicked'
    				? 'text-orange-600'
    				: 'text-rose-600'))) {
    				attr_dev(span, "class", span_class_value);
    			}

    			if (dirty[0] & /*bots*/ 8 && t2_value !== (t2_value = /*username*/ ctx[31] + "")) set_data_dev(t2, t2_value);
    			if (dirty[0] & /*bots*/ 8 && t4_value !== (t4_value = /*server*/ ctx[32].host + "")) set_data_dev(t4, t4_value);
    			if (dirty[0] & /*bots*/ 8 && t6_value !== (t6_value = /*server*/ ctx[32].port + "")) set_data_dev(t6, t6_value);

    			if (dirty[0] & /*bots, selectedBotItem*/ 72) {
    				toggle_class(div, "selected", /*id*/ ctx[30] == /*selectedBotItem*/ ctx[6]?.id);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(179:2) {#each bots as { id,username,server,status }",
    		ctx
    	});

    	return block;
    }

    // (206:4) {:else}
    function create_else_block_1(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*chatHistory*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*chatHistory*/ 16) {
    				each_value_1 = /*chatHistory*/ ctx[4];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(206:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (204:4) {#if chatHistory.length == 0}
    function create_if_block_1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "No chat history yet.";
    			add_location(p, file, 204, 4, 6815);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(204:4) {#if chatHistory.length == 0}",
    		ctx
    	});

    	return block;
    }

    // (207:4) {#each chatHistory as { timestamp, message }
    function create_each_block_1(ctx) {
    	let p;
    	let t0;
    	let t1_value = displayDateTime(/*timestamp*/ ctx[25]) + "";
    	let t1;
    	let t2;
    	let t3_value = /*message*/ ctx[26] + "";
    	let t3;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("[");
    			t1 = text(t1_value);
    			t2 = text("] ");
    			t3 = text(t3_value);
    			add_location(p, file, 207, 4, 6912);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*chatHistory*/ 16 && t1_value !== (t1_value = displayDateTime(/*timestamp*/ ctx[25]) + "")) set_data_dev(t1, t1_value);
    			if (dirty[0] & /*chatHistory*/ 16 && t3_value !== (t3_value = /*message*/ ctx[26] + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(207:4) {#each chatHistory as { timestamp, message }",
    		ctx
    	});

    	return block;
    }

    // (217:4) {:else}
    function create_else_block(ctx) {
    	let each_1_anchor;
    	let each_value = /*logHistory*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*logHistory*/ 32) {
    				each_value = /*logHistory*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(217:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (215:4) {#if logHistory.length == 0}
    function create_if_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "No log history yet.";
    			add_location(p, file, 215, 4, 7123);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(215:4) {#if logHistory.length == 0}",
    		ctx
    	});

    	return block;
    }

    // (218:4) {#each logHistory as { timestamp, message }
    function create_each_block(ctx) {
    	let p;
    	let t0;
    	let t1_value = displayDateTime(/*timestamp*/ ctx[25]) + "";
    	let t1;
    	let t2;
    	let t3_value = /*message*/ ctx[26] + "";
    	let t3;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("[");
    			t1 = text(t1_value);
    			t2 = text("] ");
    			t3 = text(t3_value);
    			add_location(p, file, 218, 4, 7218);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*logHistory*/ 32 && t1_value !== (t1_value = displayDateTime(/*timestamp*/ ctx[25]) + "")) set_data_dev(t1, t1_value);
    			if (dirty[0] & /*logHistory*/ 32 && t3_value !== (t3_value = /*message*/ ctx[26] + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(218:4) {#each logHistory as { timestamp, message }",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let div9;
    	let div0;
    	let span1;
    	let t2;
    	let t3;
    	let t4;
    	let span0;
    	let t5;
    	let span0_class_value;
    	let t6;
    	let div8;
    	let div3;
    	let label0;
    	let t8;
    	let div2;
    	let select0;
    	let option0;
    	let t10;
    	let div1;
    	let svg0;
    	let path0;
    	let t11;
    	let div6;
    	let label1;
    	let t13;
    	let div5;
    	let select1;
    	let option1;
    	let t15;
    	let div4;
    	let svg1;
    	let path1;
    	let t16;
    	let div7;
    	let button0;
    	let t17;
    	let button0_disabled_value;
    	let t18;
    	let div10;
    	let t19;
    	let div18;
    	let div13;
    	let div11;
    	let p0;
    	let t21;
    	let div12;
    	let p1;
    	let t23;
    	let div17;
    	let div14;
    	let t24;
    	let div15;
    	let t25;
    	let form;
    	let div16;
    	let input;
    	let t26;
    	let button1;
    	let t27;
    	let button1_disabled_value;
    	let t28;
    	let button2;
    	let t30;
    	let sveltetoast;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_4 = /*serverConfig*/ ctx[2].servers;
    	validate_each_argument(each_value_4);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks_1[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	let each_value_3 = /*serverConfig*/ ctx[2].bots;
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	function select_block_type(ctx, dirty) {
    		if (/*bots*/ ctx[3].length == 0) return create_if_block_2;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*chatHistory*/ ctx[4].length == 0) return create_if_block_1;
    		return create_else_block_1;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (/*logHistory*/ ctx[5].length == 0) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type_2 = select_block_type_2(ctx);
    	let if_block2 = current_block_type_2(ctx);

    	sveltetoast = new SvelteToast({
    			props: {
    				SvelteToastOptions: /*SvelteToastOptions*/ ctx[11]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Welcome to MineBot!";
    			t1 = space();
    			div9 = element("div");
    			div0 = element("div");
    			span1 = element("span");
    			t2 = text("Status: ");
    			t3 = text(/*botStatus*/ ctx[1]);
    			t4 = space();
    			span0 = element("span");
    			t5 = text("⬤");
    			t6 = space();
    			div8 = element("div");
    			div3 = element("div");
    			label0 = element("label");
    			label0.textContent = "Server List";
    			t8 = space();
    			div2 = element("div");
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "--Please select--";

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t10 = space();
    			div1 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t11 = space();
    			div6 = element("div");
    			label1 = element("label");
    			label1.textContent = "Bot List";
    			t13 = space();
    			div5 = element("div");
    			select1 = element("select");
    			option1 = element("option");
    			option1.textContent = "--Please select--";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t15 = space();
    			div4 = element("div");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t16 = space();
    			div7 = element("div");
    			button0 = element("button");
    			t17 = text("Start Bot");
    			t18 = space();
    			div10 = element("div");
    			if_block0.c();
    			t19 = space();
    			div18 = element("div");
    			div13 = element("div");
    			div11 = element("div");
    			p0 = element("p");
    			p0.textContent = "Chat";
    			t21 = space();
    			div12 = element("div");
    			p1 = element("p");
    			p1.textContent = "Log";
    			t23 = space();
    			div17 = element("div");
    			div14 = element("div");
    			if_block1.c();
    			t24 = space();
    			div15 = element("div");
    			if_block2.c();
    			t25 = space();
    			form = element("form");
    			div16 = element("div");
    			input = element("input");
    			t26 = space();
    			button1 = element("button");
    			t27 = text("Send");
    			t28 = space();
    			button2 = element("button");
    			button2.textContent = "EMIT TOAST";
    			t30 = space();
    			create_component(sveltetoast.$$.fragment);
    			attr_dev(h1, "class", "text-orange-600 svelte-1pkwv9p");
    			add_location(h1, file, 114, 1, 2890);

    			attr_dev(span0, "class", span0_class_value = "shadow " + (/*botStatus*/ ctx[1] == 'Online'
    			? 'text-green-500'
    			: 'text-rose-600'));

    			add_location(span0, file, 118, 24, 3170);
    			attr_dev(span1, "class", "shadow rounded-full bg-orange-300 uppercase px-2 py-1 text-xs font-normal tracking-wide mr-3");
    			add_location(span1, file, 117, 3, 3038);
    			add_location(div0, file, 116, 2, 3029);
    			attr_dev(label0, "class", "text-gray-700 text-sm font-bold mb-2");
    			attr_dev(label0, "for", "selectedServer");
    			add_location(label0, file, 125, 4, 3361);
    			option0.__value = "-1";
    			option0.value = option0.__value;
    			add_location(option0, file, 132, 6, 3751);
    			attr_dev(select0, "class", "block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-1 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500");
    			attr_dev(select0, "id", "selectedServer");
    			if (/*selectedServer*/ ctx[10] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[14].call(select0));
    			add_location(select0, file, 129, 5, 3497);
    			attr_dev(path0, "d", "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z");
    			add_location(path0, file, 139, 7, 4144);
    			attr_dev(svg0, "class", "fill-current h-4 w-4");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 20 20");
    			add_location(svg0, file, 138, 6, 4047);
    			attr_dev(div1, "class", "pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700");
    			add_location(div1, file, 137, 5, 3943);
    			attr_dev(div2, "class", "relative");
    			add_location(div2, file, 128, 4, 3469);
    			attr_dev(div3, "class", "inline-block w-1/4 mr-2");
    			add_location(div3, file, 124, 3, 3319);
    			attr_dev(label1, "class", "text-gray-700 text-sm font-bold mb-2");
    			attr_dev(label1, "for", "selectedBot");
    			add_location(label1, file, 145, 4, 4323);
    			option1.__value = "-1";
    			option1.value = option1.__value;
    			add_location(option1, file, 152, 6, 4701);
    			attr_dev(select1, "class", "block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-1 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500");
    			attr_dev(select1, "id", "selectedBot");
    			if (/*selectedBot*/ ctx[9] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[15].call(select1));
    			add_location(select1, file, 149, 5, 4453);
    			attr_dev(path1, "d", "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z");
    			add_location(path1, file, 159, 7, 5077);
    			attr_dev(svg1, "class", "fill-current h-4 w-4");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 20 20");
    			add_location(svg1, file, 158, 6, 4980);
    			attr_dev(div4, "class", "pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700");
    			add_location(div4, file, 157, 5, 4876);
    			attr_dev(div5, "class", "relative");
    			add_location(div5, file, 148, 4, 4425);
    			attr_dev(div6, "class", "inline-block w-1/4 mr-2");
    			add_location(div6, file, 144, 3, 4281);
    			attr_dev(button0, "class", "minebot-button-primary svelte-1pkwv9p");
    			button0.disabled = button0_disabled_value = /*selectedBot*/ ctx[9] == -1 || /*selectedServer*/ ctx[10] == -1;
    			add_location(button0, file, 165, 4, 5257);
    			attr_dev(div7, "class", "inline-block w-auto mr-2");
    			add_location(div7, file, 164, 3, 5214);
    			attr_dev(div8, "class", "align-center");
    			add_location(div8, file, 123, 2, 3289);
    			attr_dev(div9, "class", "container mx-auto w-99 py-2 bg-white shadow rounded grid grid-cols-1");
    			add_location(div9, file, 115, 1, 2944);
    			attr_dev(div10, "class", "mx-auto w-full container grid grid-cols-6 mt-4 gap-1");
    			add_location(div10, file, 171, 1, 5418);
    			add_location(p0, file, 193, 4, 6372);
    			attr_dev(div11, "class", "minebot-container basis-0 px-4 py-2 cursor-pointer svelte-1pkwv9p");
    			toggle_class(div11, "selected", /*displayChatTab*/ ctx[7]);
    			add_location(div11, file, 191, 3, 6187);
    			add_location(p1, file, 197, 4, 6581);
    			attr_dev(div12, "class", "minebot-container basis-0 px-4 py-2 cursor-pointer svelte-1pkwv9p");
    			toggle_class(div12, "selected", /*displayLogTab*/ ctx[8]);
    			add_location(div12, file, 195, 3, 6397);
    			attr_dev(div13, "class", "flex flex-none");
    			add_location(div13, file, 190, 2, 6155);
    			attr_dev(div14, "class", "overflow-y-auto h-25 text-left px-1 max-h-96");
    			toggle_class(div14, "hidden", /*displayLogTab*/ ctx[8]);
    			add_location(div14, file, 202, 3, 6689);
    			attr_dev(div15, "class", "overflow-y-auto h-25 text-left px-1 max-h-96");
    			toggle_class(div15, "hidden", /*displayChatTab*/ ctx[7]);
    			add_location(div15, file, 213, 3, 6997);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "mr-1 svelte-1pkwv9p");
    			attr_dev(input, "id", "command");
    			attr_dev(input, "placeholder", "Type your command here. Type 'help' for command list.");
    			add_location(input, file, 227, 5, 7392);
    			attr_dev(button1, "class", "minebot-button-primary svelte-1pkwv9p");
    			button1.disabled = button1_disabled_value = /*command*/ ctx[0] == '';
    			attr_dev(button1, "type", "submit");
    			add_location(button1, file, 229, 5, 7538);
    			attr_dev(div16, "class", "flex flex-row mt-1");
    			add_location(div16, file, 226, 4, 7354);
    			add_location(form, file, 225, 3, 7304);
    			attr_dev(div17, "class", "w-full bg-white shadow rounded py-1 px-1 grid grid-cols-1");
    			add_location(div17, file, 201, 2, 6614);
    			attr_dev(div18, "class", "container mx-auto mt-4");
    			add_location(div18, file, 189, 1, 6116);
    			attr_dev(button2, "class", "minebot-button-primary svelte-1pkwv9p");
    			add_location(button2, file, 235, 1, 7668);
    			attr_dev(main, "class", "h-screen bg-gradient-to-r from-cyan-100 to-slate-300 place-content-center svelte-1pkwv9p");
    			add_location(main, file, 112, 0, 2775);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, div9);
    			append_dev(div9, div0);
    			append_dev(div0, span1);
    			append_dev(span1, t2);
    			append_dev(span1, t3);
    			append_dev(span1, t4);
    			append_dev(span1, span0);
    			append_dev(span0, t5);
    			append_dev(div9, t6);
    			append_dev(div9, div8);
    			append_dev(div8, div3);
    			append_dev(div3, label0);
    			append_dev(div3, t8);
    			append_dev(div3, div2);
    			append_dev(div2, select0);
    			append_dev(select0, option0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select0, null);
    			}

    			select_option(select0, /*selectedServer*/ ctx[10]);
    			append_dev(div2, t10);
    			append_dev(div2, div1);
    			append_dev(div1, svg0);
    			append_dev(svg0, path0);
    			append_dev(div8, t11);
    			append_dev(div8, div6);
    			append_dev(div6, label1);
    			append_dev(div6, t13);
    			append_dev(div6, div5);
    			append_dev(div5, select1);
    			append_dev(select1, option1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select1, null);
    			}

    			select_option(select1, /*selectedBot*/ ctx[9]);
    			append_dev(div5, t15);
    			append_dev(div5, div4);
    			append_dev(div4, svg1);
    			append_dev(svg1, path1);
    			append_dev(div8, t16);
    			append_dev(div8, div7);
    			append_dev(div7, button0);
    			append_dev(button0, t17);
    			append_dev(main, t18);
    			append_dev(main, div10);
    			if_block0.m(div10, null);
    			append_dev(main, t19);
    			append_dev(main, div18);
    			append_dev(div18, div13);
    			append_dev(div13, div11);
    			append_dev(div11, p0);
    			append_dev(div13, t21);
    			append_dev(div13, div12);
    			append_dev(div12, p1);
    			append_dev(div18, t23);
    			append_dev(div18, div17);
    			append_dev(div17, div14);
    			if_block1.m(div14, null);
    			append_dev(div17, t24);
    			append_dev(div17, div15);
    			if_block2.m(div15, null);
    			append_dev(div17, t25);
    			append_dev(div17, form);
    			append_dev(form, div16);
    			append_dev(div16, input);
    			set_input_value(input, /*command*/ ctx[0]);
    			append_dev(div16, t26);
    			append_dev(div16, button1);
    			append_dev(button1, t27);
    			append_dev(main, t28);
    			append_dev(main, button2);
    			append_dev(main, t30);
    			mount_component(sveltetoast, main, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[14]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[15]),
    					listen_dev(button0, "click", /*startBot*/ ctx[13], false, false, false),
    					listen_dev(div11, "click", /*click_handler_1*/ ctx[17], false, false, false),
    					listen_dev(div11, "keydown", keydown_handler_1, false, false, false),
    					listen_dev(div12, "click", /*click_handler_2*/ ctx[18], false, false, false),
    					listen_dev(div12, "keydown", keydown_handler_2, false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[19]),
    					listen_dev(form, "submit", prevent_default(/*sendCommand*/ ctx[12]), false, true, false),
    					listen_dev(button2, "click", /*click_handler_3*/ ctx[20], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*botStatus*/ 2) set_data_dev(t3, /*botStatus*/ ctx[1]);

    			if (!current || dirty[0] & /*botStatus*/ 2 && span0_class_value !== (span0_class_value = "shadow " + (/*botStatus*/ ctx[1] == 'Online'
    			? 'text-green-500'
    			: 'text-rose-600'))) {
    				attr_dev(span0, "class", span0_class_value);
    			}

    			if (dirty[0] & /*serverConfig*/ 4) {
    				each_value_4 = /*serverConfig*/ ctx[2].servers;
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_4(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_4.length;
    			}

    			if (dirty[0] & /*selectedServer*/ 1024) {
    				select_option(select0, /*selectedServer*/ ctx[10]);
    			}

    			if (dirty[0] & /*serverConfig*/ 4) {
    				each_value_3 = /*serverConfig*/ ctx[2].bots;
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}

    			if (dirty[0] & /*selectedBot*/ 512) {
    				select_option(select1, /*selectedBot*/ ctx[9]);
    			}

    			if (!current || dirty[0] & /*selectedBot, selectedServer*/ 1536 && button0_disabled_value !== (button0_disabled_value = /*selectedBot*/ ctx[9] == -1 || /*selectedServer*/ ctx[10] == -1)) {
    				prop_dev(button0, "disabled", button0_disabled_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div10, null);
    				}
    			}

    			if (!current || dirty[0] & /*displayChatTab*/ 128) {
    				toggle_class(div11, "selected", /*displayChatTab*/ ctx[7]);
    			}

    			if (!current || dirty[0] & /*displayLogTab*/ 256) {
    				toggle_class(div12, "selected", /*displayLogTab*/ ctx[8]);
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div14, null);
    				}
    			}

    			if (!current || dirty[0] & /*displayLogTab*/ 256) {
    				toggle_class(div14, "hidden", /*displayLogTab*/ ctx[8]);
    			}

    			if (current_block_type_2 === (current_block_type_2 = select_block_type_2(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type_2(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div15, null);
    				}
    			}

    			if (!current || dirty[0] & /*displayChatTab*/ 128) {
    				toggle_class(div15, "hidden", /*displayChatTab*/ ctx[7]);
    			}

    			if (dirty[0] & /*command*/ 1 && input.value !== /*command*/ ctx[0]) {
    				set_input_value(input, /*command*/ ctx[0]);
    			}

    			if (!current || dirty[0] & /*command*/ 1 && button1_disabled_value !== (button1_disabled_value = /*command*/ ctx[0] == '')) {
    				prop_dev(button1, "disabled", button1_disabled_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sveltetoast.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sveltetoast.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if_block0.d();
    			if_block1.d();
    			if_block2.d();
    			destroy_component(sveltetoast);
    			mounted = false;
    			run_all(dispose);
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

    function displayDateTime(epoch) {
    	let d = new Date(epoch);
    	let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
    	let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
    	let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);

    	let time = new Intl.DateTimeFormat('en',
    	{
    			hour: '2-digit',
    			minute: '2-digit',
    			second: '2-digit',
    			hour12: false
    		}).format(d);

    	return `${da}/${mo}/${ye} ${time}`;
    }

    const keydown_handler = () => {
    	
    };

    const keydown_handler_1 = () => {
    	
    };

    const keydown_handler_2 = () => {
    	
    };

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const SvelteToastOptions = {};
    	let command = "";
    	let botStatus = "Offline";
    	let serverConfig = { servers: [], bots: [] };
    	let bots = [];
    	let chatHistory = [];
    	let logHistory = [];
    	let selectedBotItem = null;
    	let displayChatTab = true;
    	let displayLogTab = false;
    	let selectedBot = -1;
    	let selectedServer = -1;

    	let sendCommand = () => {
    		sendRequest('commandBot', 'POST', { botId: selectedBotItem.id, command }).then(x => {
    			
    		}).catch(err => {
    			error(err);
    		});

    		$$invalidate(0, command = '');
    	};

    	let getConfig = () => {
    		sendRequest('config').then(x => {
    			$$invalidate(2, serverConfig = x);
    		}).catch(err => {
    			error(err);
    		});
    	};

    	let getInfo = () => {
    		if (!(selectedBotItem && selectedBotItem.id)) return;

    		sendRequest('getInfo', 'POST', { botId: selectedBotItem.id }).then(x => {
    			$$invalidate(4, chatHistory = x.chatHistory);
    			$$invalidate(5, logHistory = x.logHistory);
    		}).catch(err => {
    			error(err);
    		});
    	};

    	let getCurrentBot = () => {
    		sendRequest('currentBot').then(x => {
    			$$invalidate(1, botStatus = "Online");
    			$$invalidate(3, bots = x.bots);

    			if (!selectedBotItem) {
    				$$invalidate(6, selectedBotItem = bots[0]);
    			}
    		}).catch(err => {
    			$$invalidate(1, botStatus = "Offline");
    			error(err);
    		});
    	};

    	let startBot = () => {
    		sendRequest('createBot', 'POST', {
    			serverIndex: selectedServer,
    			botIndex: selectedBot
    		}).then(x => {
    			getCurrentBot();
    		}).catch(err => {
    			error(err);
    		});
    	};

    	let sendRequest = (uri, method, content) => {
    		let xhrMethod = method ?? 'GET';

    		return new Promise((resolve, reject) => {
    				const xhr = new XMLHttpRequest();
    				xhr.open(xhrMethod, `/${uri}`, true);
    				xhr.setRequestHeader("Content-Type", "application/json");

    				xhr.onreadystatechange = () => {
    					if (xhr.readyState === XMLHttpRequest.DONE) {
    						if (xhr.status === 200) {
    							resolve(JSON.parse(xhr.response));
    						} else if (xhr.status >= 400 && xhr.status < 600) {
    							reject(JSON.parse(xhr.response).error);
    						}
    					}
    				};

    				xhr.onerror = e => {
    					reject("Unknown Error Occured. Server response not received.");
    				};

    				xhr.send(JSON.stringify(content));
    			});
    	};

    	getConfig();
    	setInterval(getCurrentBot, 1000);
    	setInterval(getInfo, 1000);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function select0_change_handler() {
    		selectedServer = select_value(this);
    		$$invalidate(10, selectedServer);
    	}

    	function select1_change_handler() {
    		selectedBot = select_value(this);
    		$$invalidate(9, selectedBot);
    	}

    	const click_handler = (id, username, server, status) => {
    		$$invalidate(6, selectedBotItem = { id, username, server, status });
    	};

    	const click_handler_1 = () => {
    		$$invalidate(7, displayChatTab = true);
    		$$invalidate(8, displayLogTab = false);
    	};

    	const click_handler_2 = () => {
    		$$invalidate(7, displayChatTab = false);
    		$$invalidate(8, displayLogTab = true);
    	};

    	function input_input_handler() {
    		command = this.value;
    		$$invalidate(0, command);
    	}

    	const click_handler_3 = () => success('Hello world!');

    	$$self.$capture_state = () => ({
    		SvelteToast,
    		SvelteToastOptions,
    		Tailwindcss: Tailwind,
    		success,
    		error,
    		warn,
    		displayDateTime,
    		command,
    		botStatus,
    		serverConfig,
    		bots,
    		chatHistory,
    		logHistory,
    		selectedBotItem,
    		displayChatTab,
    		displayLogTab,
    		selectedBot,
    		selectedServer,
    		sendCommand,
    		getConfig,
    		getInfo,
    		getCurrentBot,
    		startBot,
    		sendRequest
    	});

    	$$self.$inject_state = $$props => {
    		if ('command' in $$props) $$invalidate(0, command = $$props.command);
    		if ('botStatus' in $$props) $$invalidate(1, botStatus = $$props.botStatus);
    		if ('serverConfig' in $$props) $$invalidate(2, serverConfig = $$props.serverConfig);
    		if ('bots' in $$props) $$invalidate(3, bots = $$props.bots);
    		if ('chatHistory' in $$props) $$invalidate(4, chatHistory = $$props.chatHistory);
    		if ('logHistory' in $$props) $$invalidate(5, logHistory = $$props.logHistory);
    		if ('selectedBotItem' in $$props) $$invalidate(6, selectedBotItem = $$props.selectedBotItem);
    		if ('displayChatTab' in $$props) $$invalidate(7, displayChatTab = $$props.displayChatTab);
    		if ('displayLogTab' in $$props) $$invalidate(8, displayLogTab = $$props.displayLogTab);
    		if ('selectedBot' in $$props) $$invalidate(9, selectedBot = $$props.selectedBot);
    		if ('selectedServer' in $$props) $$invalidate(10, selectedServer = $$props.selectedServer);
    		if ('sendCommand' in $$props) $$invalidate(12, sendCommand = $$props.sendCommand);
    		if ('getConfig' in $$props) getConfig = $$props.getConfig;
    		if ('getInfo' in $$props) getInfo = $$props.getInfo;
    		if ('getCurrentBot' in $$props) getCurrentBot = $$props.getCurrentBot;
    		if ('startBot' in $$props) $$invalidate(13, startBot = $$props.startBot);
    		if ('sendRequest' in $$props) sendRequest = $$props.sendRequest;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		command,
    		botStatus,
    		serverConfig,
    		bots,
    		chatHistory,
    		logHistory,
    		selectedBotItem,
    		displayChatTab,
    		displayLogTab,
    		selectedBot,
    		selectedServer,
    		SvelteToastOptions,
    		sendCommand,
    		startBot,
    		select0_change_handler,
    		select1_change_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		input_input_handler,
    		click_handler_3
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
