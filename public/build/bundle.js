
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
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
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.wholeText !== data)
            text.data = data;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
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
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
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
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                info.blocks[i] = null;
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

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

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
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

    /* src/components/Dropdown.svelte generated by Svelte v3.25.1 */

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (69:2) {#if shown}
    function create_if_block(ctx) {
    	let div;
    	let div_transition;
    	let current;
    	let each_value = /*items*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div, "class", "dropdown-content svelte-1bg4nas");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*handleItemSelect, items*/ 18) {
    				each_value = /*items*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { y: -40, duration: 350, easing: cubicOut }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { y: -40, duration: 350, easing: cubicOut }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};
    }

    // (73:6) {#each items as item}
    function create_each_block(ctx) {
    	let p;
    	let t_value = /*item*/ ctx[7] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[6](/*item*/ ctx[7], ...args);
    	}

    	return {
    		c() {
    			p = element("p");
    			t = text(t_value);
    			attr(p, "class", "svelte-1bg4nas");
    		},
    		m(target, anchor) {
    			insert(target, p, anchor);
    			append(p, t);

    			if (!mounted) {
    				dispose = listen(p, "click", click_handler_1);
    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*items*/ 2 && t_value !== (t_value = /*item*/ ctx[7] + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(p);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment(ctx) {
    	let main;
    	let button;
    	let span;
    	let t0;
    	let i;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*shown*/ ctx[2] && create_if_block(ctx);

    	return {
    		c() {
    			main = element("main");
    			button = element("button");
    			span = element("span");
    			t0 = text(/*value*/ ctx[0]);
    			i = element("i");
    			t1 = space();
    			if (if_block) if_block.c();
    			attr(i, "class", "caret svelte-1bg4nas");
    			attr(button, "class", "svelte-1bg4nas");
    			attr(main, "class", "svelte-1bg4nas");
    		},
    		m(target, anchor) {
    			insert(target, main, anchor);
    			append(main, button);
    			append(button, span);
    			append(span, t0);
    			append(button, i);
    			append(main, t1);
    			if (if_block) if_block.m(main, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(window, "click", /*click_handler*/ ctx[5]),
    					listen(button, "click", /*toggleDropdown*/ ctx[3])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (!current || dirty & /*value*/ 1) set_data(t0, /*value*/ ctx[0]);

    			if (/*shown*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*shown*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(main);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { value } = $$props;
    	let { items } = $$props;
    	let shown = false;

    	function toggleDropdown(e) {
    		e.stopPropagation();
    		$$invalidate(2, shown = !shown);
    	}

    	function handleItemSelect(item) {
    		$$invalidate(2, shown = !shown);
    		$$invalidate(0, value = item);
    	}

    	const click_handler = () => $$invalidate(2, shown = false);
    	const click_handler_1 = item => handleItemSelect(item);

    	$$self.$$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("items" in $$props) $$invalidate(1, items = $$props.items);
    	};

    	return [
    		value,
    		items,
    		shown,
    		toggleDropdown,
    		handleItemSelect,
    		click_handler,
    		click_handler_1
    	];
    }

    class Dropdown extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance, create_fragment, safe_not_equal, { value: 0, items: 1 });
    	}
    }

    /* src/components/Button.svelte generated by Svelte v3.25.1 */

    function create_fragment$1(ctx) {
    	let main;
    	let button;
    	let t;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			main = element("main");
    			button = element("button");
    			t = text(/*label*/ ctx[0]);
    			attr(button, "class", "svelte-nfob3u");
    		},
    		m(target, anchor) {
    			insert(target, main, anchor);
    			append(main, button);
    			append(button, t);

    			if (!mounted) {
    				dispose = listen(button, "click", function () {
    					if (is_function(/*onClick*/ ctx[1])) /*onClick*/ ctx[1].apply(this, arguments);
    				});

    				mounted = true;
    			}
    		},
    		p(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*label*/ 1) set_data(t, /*label*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(main);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { label } = $$props;
    	let { onClick } = $$props;

    	$$self.$$set = $$props => {
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    		if ("onClick" in $$props) $$invalidate(1, onClick = $$props.onClick);
    	};

    	return [label, onClick];
    }

    class Button extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { label: 0, onClick: 1 });
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
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
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const remote = window.require("electron").remote;
    const path = window.require("path");
    const fs = window.require("fs");
    const got = window.require("got");
    const extract = window.require("extract-zip");
    const child_process = window.require("child_process");
    const exec = child_process.execSync;
    const spawn = child_process.spawn;
    const util = window.require("util");
    const stream = window.require("stream");
    const currentPage = writable("index");
    const pageHistory = writable(["index"]);
    function navigate(page) {
        currentPage.set(page);
        pageHistory.update((value) => {
            if (page !== value[value.length - 1]) {
                value.push(page);
            }
            return value;
        });
    }
    const DIR = path.join(remote.app.getPath("temp"), "symbit");
    const LOG_DIR = path.join(DIR, ".logs");
    const LOG_PATH = path.join(LOG_DIR, `symbit.log`);
    const PLATFORM_TOOLS_DIR = path.join(DIR, "platform-tools");
    const MAGISK_MANAGER_APK_PATH = path.join(DIR, "magisk-manager.apk");
    var SUPPORTED_DEVICE_TYPES;
    (function (SUPPORTED_DEVICE_TYPES) {
        SUPPORTED_DEVICE_TYPES["GOOGLE_PIXEL"] = "Google Pixel";
        SUPPORTED_DEVICE_TYPES["ONEPLUS"] = "OnePlus";
    })(SUPPORTED_DEVICE_TYPES || (SUPPORTED_DEVICE_TYPES = {}));
    var ACTIONS;
    (function (ACTIONS) {
        ACTIONS["UPDATE"] = "update";
        ACTIONS["ROOT"] = "root";
    })(ACTIONS || (ACTIONS = {}));
    const STRINGS = {
        unsupported_device: "Unfortunately your device has not been supported yet 😕",
        enable_developer_options: indoc `
    1. Go to settings > about phone
    2. Tap "build number" 7 times
  `,
        enable_usb_debugging: indoc `
    1. Go to the Developer Options menu
    2. Scroll down to find "USB Debugging"
    3. Flip the switch and you're good to go!
  `,
        enable_oem_unlocking: indoc `
    Instructions:
    1. Go to the Developer Options menu
    2. Scroll down to find "OEM Unlocking"
    3. Flip the switch and you're good to go!
  `,
        adb_always_allow: indoc `
    Please check the 'always allow' option for ADB
    if you see a popup asking you to allow this PC to connect with ADB.
  `,
        tip_drag_folder_into_terminal: indoc `TIP: You can drag and drop the folder into the terminal`,
        patch_boot_image_file_instructions: indoc `
    Now you'll need to patch the boot image file using the Magisk Manager app
    on your Android device.

    1. Open Magisk
    2. Tap 'install'
    3. Tap 'install' again
    4. Tap 'Select and Patch a File'
    5. Go to the root of your Pixel's file manager
       and select the boot.img file
    NOTE: After patching the boot.img, DO NOT REBOOT.
  `,
        install_python_instructions: indoc `
    You'll need to install Python on your system. Get it here:
    https://www.python.org/downloads/
    If you are using Linux, you know what to do 😉
  `,
        magisk_canary_instructions: indoc `
    You can install Magisk Canary by:
    1. Updating your existing Magisk to the canary channel (recommended)
    2. Installing the canary version of Magisk Manager
  `,
        magisk_canary_instructions_update_existing: indoc `
    To move your existing installation to the Canary channel,
    1. Open Magisk Manager
    2. Go to the settings page
    3. Scroll down and tap on "Update Channel"
    4. Tap "Custom Channel"
    5. In the input box, type https://raw.githubusercontent.com/topjohnwu/magisk_files/canary/debug.json
  `,
        magisk_canary_instructions_install_new: indoc `
    You can install the canary version of Magisk here:
    https://raw.githubusercontent.com/topjohnwu/magisk_files/canary/app-debug.apk
  `,
    };
    // HELPER FUNCTIONS
    // ------------------------------------------
    //
    class Log {
        static getTime() {
            const date = new Date();
            return `[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}]`;
        }
        static async logFile(_) {
            fs.appendFile(LOG_PATH, `${String(_)}\n`, (err) => {
                if (err)
                    throw err;
            });
        }
        static d(_) {
            const message = `${this.getTime()} [debug] ${_}`;
            this.logFile(message);
            console.log(message);
        }
        static i(_) {
            const message = `${this.getTime()} [info] ${_}`;
            this.logFile(message);
            console.log(message);
        }
        static w(_) {
            const message = `${this.getTime()} [warning] ${_}`;
            this.logFile(message);
            console.log(message);
        }
        static e(_) {
            const message = `${this.getTime()} [ERROR] ${_}`;
            this.logFile(message);
            console.log(message);
        }
        static f(_) {
            const message = `${this.getTime()} [FATAL] ${_}`;
            this.logFile(message);
            console.log(message);
        }
    }
    /**
     * Throws an error to the user
     */
    function printError(message) {
        console.log(message);
        process.exit(1);
    }
    /**
     * # Indented Documents
     *
     * Template literal function to generate unindented strings
     *
     * @example
     * indoc`
     *   test
     * `
     * // output: `test`
     */
    function indoc(document) {
        // console.log(document[0].split("\n"));
        return document[0]
            .split("\n")
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
            .join("\n");
    }
    /**
     * Ask for input from the user
     */
    // export async function input(message: string): Promise<string> {
    //   const { response } = await inquirer.prompt([
    //     { type: "input", name: "response", message: message },
    //   ]);
    //   return response;
    // }
    /**
     * Ask for input from the user
     */
    // export async function inputConfirmation(message: string): Promise<boolean> {
    //   const { confirmation } = await inquirer.prompt([
    //     { type: "confirm", name: "confirmation", message: message },
    //   ]);
    //   return confirmation;
    // }
    /**
     * Ask for input from the user
     */
    // export async function inputChoice(
    //   message: string,
    //   choices: string[]
    // ): Promise<string> {
    //   const { choice } = await inquirer.prompt([
    //     { type: "list", name: "choice", message: message, choices: choices },
    //   ]);
    //   return choice;
    // }
    const pipeline = util.promisify(stream.pipeline);
    /**
     * Run command on the shell
     */
    function shellExec(...command) {
        try {
            const output = exec(command.join(" ")).toString();
            Log.i(output);
        }
        catch (e) {
            Log.e(e.message);
        }
    }
    /**
     * Run ADB on the shell
     */
    function adb(...command) {
        if (process.platform === "win32")
            shellExec(`${PLATFORM_TOOLS_DIR}\\adb.exe ${command.join(" ")}`);
        else if (process.platform === "linux" || process.platform === "darwin")
            shellExec(`${PLATFORM_TOOLS_DIR}/adb ${command.join(" ")}`);
    }
    /**
     * Run Fastboot on the shell
     */
    function fastboot(...command) {
        if (process.platform === "win32")
            shellExec(`${PLATFORM_TOOLS_DIR}\\fastboot.exe ${command.join(" ")}`);
        else if (process.platform === "linux" || process.platform === "darwin")
            shellExec(`${PLATFORM_TOOLS_DIR}/fastboot ${command.join(" ")}`);
    }
    /**
     * Run chmod on the shell
     */
    function chmod(mode, ...files) {
        if (process.platform === "linux" || process.platform === "darwin")
            shellExec(`chmod ${mode} ${files.join(" ")}`);
    }

    /* src/components/Link.svelte generated by Svelte v3.25.1 */

    function create_fragment$2(ctx) {
    	let span;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	return {
    		c() {
    			span = element("span");
    			if (default_slot) default_slot.c();
    			attr(span, "class", "link svelte-1x7wqoq");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen(span, "click", /*click_handler*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { href } = $$props;
    	const click_handler = () => remote.shell.openExternal(href);

    	$$self.$$set = $$props => {
    		if ("href" in $$props) $$invalidate(0, href = $$props.href);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	return [href, $$scope, slots, click_handler];
    }

    class Link extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { href: 0 });
    	}
    }

    /* src/pages/index.svelte generated by Svelte v3.25.1 */

    function create_default_slot(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("github");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	let main;
    	let div1;
    	let span0;
    	let t1;
    	let div0;
    	let link;
    	let t2;
    	let div7;
    	let div3;
    	let h10;
    	let t4;
    	let div2;
    	let dropdown;
    	let t5;
    	let div6;
    	let h11;
    	let t7;
    	let div4;
    	let span1;
    	let t9;
    	let button0;
    	let t10;
    	let div5;
    	let span2;
    	let t12;
    	let button1;
    	let current;

    	link = new Link({
    			props: {
    				href: "https://github.com/raphtlw/symbit",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			}
    		});

    	dropdown = new Dropdown({
    			props: {
    				value: Object.values(SUPPORTED_DEVICE_TYPES)[0],
    				items: Object.values(SUPPORTED_DEVICE_TYPES)
    			}
    		});

    	button0 = new Button({
    			props: { onClick: /*func*/ ctx[0], label: "Root" }
    		});

    	button1 = new Button({
    			props: {
    				onClick: /*func_1*/ ctx[1],
    				label: "Update"
    			}
    		});

    	return {
    		c() {
    			main = element("main");
    			div1 = element("div");
    			span0 = element("span");
    			span0.textContent = "A root manager for Android devices which allows you to update existing\n      rooted devices, tweak magisk and run other commands which improve the\n      Android root experience and adds onto Magisk. 🚀";
    			t1 = space();
    			div0 = element("div");
    			create_component(link.$$.fragment);
    			t2 = space();
    			div7 = element("div");
    			div3 = element("div");
    			h10 = element("h1");
    			h10.textContent = "Choose your device";
    			t4 = space();
    			div2 = element("div");
    			create_component(dropdown.$$.fragment);
    			t5 = space();
    			div6 = element("div");
    			h11 = element("h1");
    			h11.textContent = "What would you like to do?";
    			t7 = space();
    			div4 = element("div");
    			span1 = element("span");
    			span1.textContent = "Root a device from scratch";
    			t9 = space();
    			create_component(button0.$$.fragment);
    			t10 = space();
    			div5 = element("div");
    			span2 = element("span");
    			span2.textContent = "Update an existing rooted device";
    			t12 = space();
    			create_component(button1.$$.fragment);
    			attr(span0, "class", "about-main svelte-3hwqx3");
    			attr(div0, "class", "about-link svelte-3hwqx3");
    			attr(div1, "class", "about svelte-3hwqx3");
    			attr(h10, "class", "svelte-3hwqx3");
    			attr(div2, "class", "choose-device__dropdown svelte-3hwqx3");
    			attr(div3, "class", "choose-device svelte-3hwqx3");
    			attr(h11, "class", "svelte-3hwqx3");
    			attr(span1, "class", "svelte-3hwqx3");
    			attr(div4, "class", "action-item svelte-3hwqx3");
    			attr(span2, "class", "svelte-3hwqx3");
    			attr(div5, "class", "action-item svelte-3hwqx3");
    			attr(div6, "class", "action svelte-3hwqx3");
    			attr(div7, "class", "main-menu svelte-3hwqx3");
    			attr(main, "class", "svelte-3hwqx3");
    		},
    		m(target, anchor) {
    			insert(target, main, anchor);
    			append(main, div1);
    			append(div1, span0);
    			append(div1, t1);
    			append(div1, div0);
    			mount_component(link, div0, null);
    			append(main, t2);
    			append(main, div7);
    			append(div7, div3);
    			append(div3, h10);
    			append(div3, t4);
    			append(div3, div2);
    			mount_component(dropdown, div2, null);
    			append(div7, t5);
    			append(div7, div6);
    			append(div6, h11);
    			append(div6, t7);
    			append(div6, div4);
    			append(div4, span1);
    			append(div4, t9);
    			mount_component(button0, div4, null);
    			append(div6, t10);
    			append(div6, div5);
    			append(div5, span2);
    			append(div5, t12);
    			mount_component(button1, div5, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const link_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			transition_in(dropdown.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(link.$$.fragment, local);
    			transition_out(dropdown.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(main);
    			destroy_component(link);
    			destroy_component(dropdown);
    			destroy_component(button0);
    			destroy_component(button1);
    		}
    	};
    }

    function instance$3($$self) {
    	const func = () => navigate("root");
    	const func_1 = () => navigate("update");
    	return [func, func_1];
    }

    class Pages extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});
    	}
    }

    /* src/components/Step.svelte generated by Svelte v3.25.1 */

    function create_fragment$4(ctx) {
    	let main;
    	let h1;
    	let t0_value = /*step*/ ctx[0].name + "";
    	let t0;
    	let t1;
    	let h2;
    	let t2_value = /*step*/ ctx[0].description + "";
    	let t2;
    	let t3;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	return {
    		c() {
    			main = element("main");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			h2 = element("h2");
    			t2 = text(t2_value);
    			t3 = space();
    			if (default_slot) default_slot.c();
    			attr(h1, "class", "svelte-1al6092");
    			attr(h2, "class", "svelte-1al6092");
    			attr(main, "class", "svelte-1al6092");
    		},
    		m(target, anchor) {
    			insert(target, main, anchor);
    			append(main, h1);
    			append(h1, t0);
    			append(main, t1);
    			append(main, h2);
    			append(h2, t2);
    			append(main, t3);

    			if (default_slot) {
    				default_slot.m(main, null);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if ((!current || dirty & /*step*/ 1) && t0_value !== (t0_value = /*step*/ ctx[0].name + "")) set_data(t0, t0_value);
    			if ((!current || dirty & /*step*/ 1) && t2_value !== (t2_value = /*step*/ ctx[0].description + "")) set_data(t2, t2_value);

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(main);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	
    	let { step } = $$props;

    	$$self.$$set = $$props => {
    		if ("step" in $$props) $$invalidate(0, step = $$props.step);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	return [step, $$scope, slots];
    }

    class Step extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { step: 0 });
    	}
    }

    /* src/components/StepBar.svelte generated by Svelte v3.25.1 */

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (37:2) {#each steps as step}
    function create_each_block$1(ctx) {
    	let div1;
    	let div0;
    	let t0_value = /*step*/ ctx[2].id + "";
    	let t0;
    	let t1;
    	let span;
    	let t2_value = /*step*/ ctx[2].name + "";
    	let t2;
    	let t3;
    	let div1_class_value;

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			span = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			attr(div0, "class", "id svelte-jdj1fh");
    			attr(span, "class", "name svelte-jdj1fh");
    			attr(div1, "class", div1_class_value = "" + (null_to_empty(`step ${/*current*/ ctx[1] === /*step*/ ctx[2] && "step-current"}`) + " svelte-jdj1fh"));
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, t0);
    			append(div1, t1);
    			append(div1, span);
    			append(span, t2);
    			append(div1, t3);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*steps*/ 1 && t0_value !== (t0_value = /*step*/ ctx[2].id + "")) set_data(t0, t0_value);
    			if (dirty & /*steps*/ 1 && t2_value !== (t2_value = /*step*/ ctx[2].name + "")) set_data(t2, t2_value);

    			if (dirty & /*current, steps*/ 3 && div1_class_value !== (div1_class_value = "" + (null_to_empty(`step ${/*current*/ ctx[1] === /*step*/ ctx[2] && "step-current"}`) + " svelte-jdj1fh"))) {
    				attr(div1, "class", div1_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    		}
    	};
    }

    function create_fragment$5(ctx) {
    	let ul;
    	let each_value = /*steps*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	return {
    		c() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(ul, "class", "svelte-jdj1fh");
    		},
    		m(target, anchor) {
    			insert(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*current, steps*/ 3) {
    				each_value = /*steps*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	
    	let { steps } = $$props;
    	let { current } = $$props;

    	$$self.$$set = $$props => {
    		if ("steps" in $$props) $$invalidate(0, steps = $$props.steps);
    		if ("current" in $$props) $$invalidate(1, current = $$props.current);
    	};

    	return [steps, current];
    }

    class StepBar extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { steps: 0, current: 1 });
    	}
    }

    /* src/components/Loader.svelte generated by Svelte v3.25.1 */

    function create_if_block$1(ctx) {
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;

    	return {
    		c() {
    			div0 = element("div");
    			div0.innerHTML = `<svg viewBox="0 0 80 80" class="svelte-1or8a4q"><circle id="test" cx="40" cy="40" r="32" class="svelte-1or8a4q"></circle></svg>`;
    			t0 = space();
    			div1 = element("div");
    			div1.innerHTML = `<svg viewBox="0 0 86 80" class="svelte-1or8a4q"><polygon points="43 8 79 72 7 72" class="svelte-1or8a4q"></polygon></svg>`;
    			t1 = space();
    			div2 = element("div");
    			div2.innerHTML = `<svg viewBox="0 0 80 80" class="svelte-1or8a4q"><rect x="8" y="8" width="64" height="64" class="svelte-1or8a4q"></rect></svg>`;
    			attr(div0, "class", "loader svelte-1or8a4q");
    			attr(div1, "class", "loader triangle svelte-1or8a4q");
    			attr(div2, "class", "loader svelte-1or8a4q");
    		},
    		m(target, anchor) {
    			insert(target, div0, anchor);
    			insert(target, t0, anchor);
    			insert(target, div1, anchor);
    			insert(target, t1, anchor);
    			insert(target, div2, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(div0);
    			if (detaching) detach(t0);
    			if (detaching) detach(div1);
    			if (detaching) detach(t1);
    			if (detaching) detach(div2);
    		}
    	};
    }

    function create_fragment$6(ctx) {
    	let if_block_anchor;
    	let if_block = /*primary*/ ctx[0] && create_if_block$1();

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, [dirty]) {
    			if (/*primary*/ ctx[0]) {
    				if (if_block) ; else {
    					if_block = create_if_block$1();
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { primary = false } = $$props;

    	$$self.$$set = $$props => {
    		if ("primary" in $$props) $$invalidate(0, primary = $$props.primary);
    	};

    	return [primary];
    }

    class Loader extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { primary: 0 });
    	}
    }

    /* src/components/StepDoneButton.svelte generated by Svelte v3.25.1 */

    function create_fragment$7(ctx) {
    	let div;
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				label: "Done",
    				onClick: /*onClick*/ ctx[0]
    			}
    		});

    	return {
    		c() {
    			div = element("div");
    			create_component(button.$$.fragment);
    			attr(div, "class", "wrapper svelte-1etqh5q");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(button, div, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const button_changes = {};
    			if (dirty & /*onClick*/ 1) button_changes.onClick = /*onClick*/ ctx[0];
    			button.$set(button_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(button);
    		}
    	};
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { onClick } = $$props;

    	$$self.$$set = $$props => {
    		if ("onClick" in $$props) $$invalidate(0, onClick = $$props.onClick);
    	};

    	return [onClick];
    }

    class StepDoneButton extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { onClick: 0 });
    	}
    }

    /* src/pages/root.svelte generated by Svelte v3.25.1 */

    function create_else_block(ctx) {
    	let t_value = navigate("index") + "";
    	let t;

    	return {
    		c() {
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (193:41) 
    function create_if_block_5(ctx) {
    	let step;
    	let current;

    	step = new Step({
    			props: {
    				step: /*steps*/ ctx[3][4],
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(step.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(step, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const step_changes = {};

    			if (dirty & /*$$scope, pathToImageZipFile*/ 2052) {
    				step_changes.$$scope = { dirty, ctx };
    			}

    			step.$set(step_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(step.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(step.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(step, detaching);
    		}
    	};
    }

    // (164:41) 
    function create_if_block_3(ctx) {
    	let step;
    	let current;

    	step = new Step({
    			props: {
    				step: /*steps*/ ctx[3][3],
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(step.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(step, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const step_changes = {};

    			if (dirty & /*$$scope, unlockBootloaderShown*/ 2050) {
    				step_changes.$$scope = { dirty, ctx };
    			}

    			step.$set(step_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(step.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(step.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(step, detaching);
    		}
    	};
    }

    // (160:41) 
    function create_if_block_2(ctx) {
    	let step;
    	let current;

    	step = new Step({
    			props: {
    				step: /*steps*/ ctx[3][2],
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(step.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(step, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const step_changes = {};

    			if (dirty & /*$$scope*/ 2048) {
    				step_changes.$$scope = { dirty, ctx };
    			}

    			step.$set(step_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(step.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(step.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(step, detaching);
    		}
    	};
    }

    // (148:41) 
    function create_if_block_1(ctx) {
    	let step;
    	let current;

    	step = new Step({
    			props: {
    				step: /*steps*/ ctx[3][1],
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(step.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(step, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const step_changes = {};

    			if (dirty & /*$$scope*/ 2048) {
    				step_changes.$$scope = { dirty, ctx };
    			}

    			step.$set(step_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(step.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(step.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(step, detaching);
    		}
    	};
    }

    // (140:6) {#if currentStep === steps[0]}
    function create_if_block$2(ctx) {
    	let step;
    	let current;

    	step = new Step({
    			props: {
    				step: /*steps*/ ctx[3][0],
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(step.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(step, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const step_changes = {};

    			if (dirty & /*$$scope*/ 2048) {
    				step_changes.$$scope = { dirty, ctx };
    			}

    			step.$set(step_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(step.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(step.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(step, detaching);
    		}
    	};
    }

    // (198:12) <Link href="https://developers.google.com/android/images">
    function create_default_slot_5(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("here.");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (220:10) {#if pathToImageZipFile !== undefined}
    function create_if_block_6(ctx) {
    	let stepdonebutton;
    	let current;
    	stepdonebutton = new StepDoneButton({ props: { onClick: /*nextStep*/ ctx[4] } });

    	return {
    		c() {
    			create_component(stepdonebutton.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(stepdonebutton, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i(local) {
    			if (current) return;
    			transition_in(stepdonebutton.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(stepdonebutton.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(stepdonebutton, detaching);
    		}
    	};
    }

    // (194:8) <Step step={steps[4]}>
    function create_default_slot_4(ctx) {
    	let div0;
    	let t0;
    	let link;
    	let t1;
    	let span0;
    	let t3;
    	let div1;
    	let button;
    	let t4;
    	let span1;
    	let t5;
    	let t6;
    	let if_block_anchor;
    	let current;

    	link = new Link({
    			props: {
    				href: "https://developers.google.com/android/images",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			}
    		});

    	button = new Button({
    			props: {
    				label: "Choose file",
    				onClick: /*func_1*/ ctx[9]
    			}
    		});

    	let if_block = /*pathToImageZipFile*/ ctx[2] !== undefined && create_if_block_6(ctx);

    	return {
    		c() {
    			div0 = element("div");
    			t0 = text("Please download the latest factory image for your Google Pixel and\n            unzip the zip file from\n            ");
    			create_component(link.$$.fragment);
    			t1 = space();
    			span0 = element("span");
    			span0.textContent = "Select the zip file you\n            downloaded";
    			t3 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			t4 = space();
    			span1 = element("span");
    			t5 = text(/*pathToImageZipFile*/ ctx[2]);
    			t6 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr(span0, "class", "spacing-top spacing-bottom svelte-1m409a6");
    			attr(span1, "class", "spacing-left svelte-1m409a6");
    			set_style(span1, "margin-top", "0.5rem");
    			attr(div1, "class", "horizontal-layout svelte-1m409a6");
    		},
    		m(target, anchor) {
    			insert(target, div0, anchor);
    			append(div0, t0);
    			mount_component(link, div0, null);
    			insert(target, t1, anchor);
    			insert(target, span0, anchor);
    			insert(target, t3, anchor);
    			insert(target, div1, anchor);
    			mount_component(button, div1, null);
    			append(div1, t4);
    			append(div1, span1);
    			append(span1, t5);
    			insert(target, t6, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const link_changes = {};

    			if (dirty & /*$$scope*/ 2048) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    			const button_changes = {};
    			if (dirty & /*pathToImageZipFile*/ 4) button_changes.onClick = /*func_1*/ ctx[9];
    			button.$set(button_changes);
    			if (!current || dirty & /*pathToImageZipFile*/ 4) set_data(t5, /*pathToImageZipFile*/ ctx[2]);

    			if (/*pathToImageZipFile*/ ctx[2] !== undefined) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*pathToImageZipFile*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_6(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			transition_in(button.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(link.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div0);
    			destroy_component(link);
    			if (detaching) detach(t1);
    			if (detaching) detach(span0);
    			if (detaching) detach(t3);
    			if (detaching) detach(div1);
    			destroy_component(button);
    			if (detaching) detach(t6);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (183:10) {#if unlockBootloaderShown}
    function create_if_block_4(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block_1,
    		then: create_then_block_1,
    		catch: create_catch_block_1,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*unlockBootloader*/ ctx[6](), info);

    	return {
    		c() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m(target, anchor) {
    			insert(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};
    }

    // (1:0) <script lang="ts">var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {     function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }
    function create_catch_block_1(ctx) {
    	return {
    		c: noop,
    		m: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    }

    // (187:12) {:then}
    function create_then_block_1(ctx) {
    	let span;

    	return {
    		c() {
    			span = element("span");
    			span.textContent = "Done!";
    			attr(span, "class", "spacing-top svelte-1m409a6");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (184:39)                <span>Unlocking your bootloader...</span>               <Loader primary />             {:then}
    function create_pending_block_1(ctx) {
    	let span;
    	let t1;
    	let loader;
    	let current;
    	loader = new Loader({ props: { primary: true } });

    	return {
    		c() {
    			span = element("span");
    			span.textContent = "Unlocking your bootloader...";
    			t1 = space();
    			create_component(loader.$$.fragment);
    			attr(span, "class", "svelte-1m409a6");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			insert(target, t1, anchor);
    			mount_component(loader, target, anchor);
    			current = true;
    		},
    		i(local) {
    			if (current) return;
    			transition_in(loader.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(loader.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    			if (detaching) detach(t1);
    			destroy_component(loader, detaching);
    		}
    	};
    }

    // (165:8) <Step step={steps[3]}>
    function create_default_slot_3(ctx) {
    	let span0;
    	let t1;
    	let p;
    	let t3;
    	let span1;
    	let t5;
    	let span2;
    	let t7;
    	let div2;
    	let div0;
    	let button0;
    	let t8;
    	let div1;
    	let button1;
    	let t9;
    	let t10;
    	let stepdonebutton;
    	let current;

    	button0 = new Button({
    			props: { label: "Yes", onClick: /*func*/ ctx[8] }
    		});

    	button1 = new Button({
    			props: {
    				label: "No",
    				onClick: /*nextStep*/ ctx[4]
    			}
    		});

    	let if_block = /*unlockBootloaderShown*/ ctx[1] && create_if_block_4(ctx);
    	stepdonebutton = new StepDoneButton({ props: { onClick: /*nextStep*/ ctx[4] } });

    	return {
    		c() {
    			span0 = element("span");
    			span0.textContent = "You first need to enable OEM unlocking.";
    			t1 = space();
    			p = element("p");
    			p.textContent = `${STRINGS.enable_oem_unlocking}`;
    			t3 = space();
    			span1 = element("span");
    			span1.textContent = "Unlock your bootloader?";
    			t5 = space();
    			span2 = element("span");
    			span2.textContent = "This process is irreversible\n            and all your data will be erased forever!";
    			t7 = space();
    			div2 = element("div");
    			div0 = element("div");
    			create_component(button0.$$.fragment);
    			t8 = space();
    			div1 = element("div");
    			create_component(button1.$$.fragment);
    			t9 = space();
    			if (if_block) if_block.c();
    			t10 = space();
    			create_component(stepdonebutton.$$.fragment);
    			attr(span0, "class", "svelte-1m409a6");
    			attr(p, "class", "spacing-top svelte-1m409a6");
    			attr(span1, "class", "spacing-top svelte-1m409a6");
    			attr(span2, "class", "spacing-top spacing-bottom svelte-1m409a6");
    			attr(div0, "class", "spacing-right svelte-1m409a6");
    			attr(div2, "class", "horizontal-layout svelte-1m409a6");
    		},
    		m(target, anchor) {
    			insert(target, span0, anchor);
    			insert(target, t1, anchor);
    			insert(target, p, anchor);
    			insert(target, t3, anchor);
    			insert(target, span1, anchor);
    			insert(target, t5, anchor);
    			insert(target, span2, anchor);
    			insert(target, t7, anchor);
    			insert(target, div2, anchor);
    			append(div2, div0);
    			mount_component(button0, div0, null);
    			append(div2, t8);
    			append(div2, div1);
    			mount_component(button1, div1, null);
    			insert(target, t9, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t10, anchor);
    			mount_component(stepdonebutton, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const button0_changes = {};
    			if (dirty & /*unlockBootloaderShown*/ 2) button0_changes.onClick = /*func*/ ctx[8];
    			button0.$set(button0_changes);

    			if (/*unlockBootloaderShown*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*unlockBootloaderShown*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t10.parentNode, t10);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(stepdonebutton.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(stepdonebutton.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(span0);
    			if (detaching) detach(t1);
    			if (detaching) detach(p);
    			if (detaching) detach(t3);
    			if (detaching) detach(span1);
    			if (detaching) detach(t5);
    			if (detaching) detach(span2);
    			if (detaching) detach(t7);
    			if (detaching) detach(div2);
    			destroy_component(button0);
    			destroy_component(button1);
    			if (detaching) detach(t9);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(t10);
    			destroy_component(stepdonebutton, detaching);
    		}
    	};
    }

    // (161:8) <Step step={steps[2]}>
    function create_default_slot_2(ctx) {
    	let stepdonebutton;
    	let current;
    	stepdonebutton = new StepDoneButton({ props: { onClick: /*nextStep*/ ctx[4] } });

    	return {
    		c() {
    			create_component(stepdonebutton.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(stepdonebutton, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i(local) {
    			if (current) return;
    			transition_in(stepdonebutton.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(stepdonebutton.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(stepdonebutton, detaching);
    		}
    	};
    }

    // (1:0) <script lang="ts">var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {     function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }
    function create_catch_block(ctx) {
    	return {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    }

    // (155:10) {:then}
    function create_then_block(ctx) {
    	let span;
    	let t1;
    	let div;

    	return {
    		c() {
    			span = element("span");
    			span.textContent = "Done!";
    			t1 = space();
    			div = element("div");
    			div.textContent = `${/*nextStep*/ ctx[4]()}`;
    			attr(span, "class", "spacing-top svelte-1m409a6");
    			attr(div, "class", "hidden svelte-1m409a6");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			insert(target, t1, anchor);
    			insert(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(span);
    			if (detaching) detach(t1);
    			if (detaching) detach(div);
    		}
    	};
    }

    // (151:41)              <div class="loading">               <Loader primary />             </div>           {:then}
    function create_pending_block(ctx) {
    	let div;
    	let loader;
    	let current;
    	loader = new Loader({ props: { primary: true } });

    	return {
    		c() {
    			div = element("div");
    			create_component(loader.$$.fragment);
    			attr(div, "class", "loading svelte-1m409a6");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(loader, div, null);
    			current = true;
    		},
    		p: noop,
    		i(local) {
    			if (current) return;
    			transition_in(loader.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(loader.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(loader);
    		}
    	};
    }

    // (149:8) <Step step={steps[1]}>
    function create_default_slot_1(ctx) {
    	let span;
    	let t1;
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*installMagiskManager*/ ctx[5](), info);

    	return {
    		c() {
    			span = element("span");
    			span.textContent = "Installing Magisk Manager onto your device...";
    			t1 = space();
    			await_block_anchor = empty();
    			info.block.c();
    			attr(span, "class", "svelte-1m409a6");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			insert(target, t1, anchor);
    			insert(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			{
    				const child_ctx = ctx.slice();
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    			if (detaching) detach(t1);
    			if (detaching) detach(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};
    }

    // (141:8) <Step step={steps[0]}>
    function create_default_slot$1(ctx) {
    	let h20;
    	let t1;
    	let p0;
    	let t3;
    	let h21;
    	let t5;
    	let p1;
    	let t7;
    	let stepdonebutton;
    	let current;
    	stepdonebutton = new StepDoneButton({ props: { onClick: /*nextStep*/ ctx[4] } });

    	return {
    		c() {
    			h20 = element("h2");
    			h20.textContent = "Enable developer options";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = `${STRINGS.enable_developer_options}`;
    			t3 = space();
    			h21 = element("h2");
    			h21.textContent = "Enable USB Debugging";
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = `${STRINGS.enable_usb_debugging}`;
    			t7 = space();
    			create_component(stepdonebutton.$$.fragment);
    			attr(h20, "class", "svelte-1m409a6");
    			attr(p0, "class", "svelte-1m409a6");
    			attr(h21, "class", "svelte-1m409a6");
    			attr(p1, "class", "svelte-1m409a6");
    		},
    		m(target, anchor) {
    			insert(target, h20, anchor);
    			insert(target, t1, anchor);
    			insert(target, p0, anchor);
    			insert(target, t3, anchor);
    			insert(target, h21, anchor);
    			insert(target, t5, anchor);
    			insert(target, p1, anchor);
    			insert(target, t7, anchor);
    			mount_component(stepdonebutton, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i(local) {
    			if (current) return;
    			transition_in(stepdonebutton.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(stepdonebutton.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(h20);
    			if (detaching) detach(t1);
    			if (detaching) detach(p0);
    			if (detaching) detach(t3);
    			if (detaching) detach(h21);
    			if (detaching) detach(t5);
    			if (detaching) detach(p1);
    			if (detaching) detach(t7);
    			destroy_component(stepdonebutton, detaching);
    		}
    	};
    }

    function create_fragment$8(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let div2;
    	let div0;
    	let stepbar;
    	let updating_current;
    	let t2;
    	let div1;
    	let current_block_type_index;
    	let if_block;
    	let current;

    	function stepbar_current_binding(value) {
    		/*stepbar_current_binding*/ ctx[7].call(null, value);
    	}

    	let stepbar_props = { steps: /*steps*/ ctx[3] };

    	if (/*currentStep*/ ctx[0] !== void 0) {
    		stepbar_props.current = /*currentStep*/ ctx[0];
    	}

    	stepbar = new StepBar({ props: stepbar_props });
    	binding_callbacks.push(() => bind(stepbar, "current", stepbar_current_binding));

    	const if_block_creators = [
    		create_if_block$2,
    		create_if_block_1,
    		create_if_block_2,
    		create_if_block_3,
    		create_if_block_5,
    		create_else_block
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*currentStep*/ ctx[0] === /*steps*/ ctx[3][0]) return 0;
    		if (/*currentStep*/ ctx[0] === /*steps*/ ctx[3][1]) return 1;
    		if (/*currentStep*/ ctx[0] === /*steps*/ ctx[3][2]) return 2;
    		if (/*currentStep*/ ctx[0] === /*steps*/ ctx[3][3]) return 3;
    		if (/*currentStep*/ ctx[0] === /*steps*/ ctx[3][4]) return 4;
    		return 5;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Let's walk through the rooting process together.";
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			create_component(stepbar.$$.fragment);
    			t2 = space();
    			div1 = element("div");
    			if_block.c();
    			attr(h1, "class", "title svelte-1m409a6");
    			attr(div0, "class", "step-bar svelte-1m409a6");
    			attr(div1, "class", "step-view svelte-1m409a6");
    			attr(div2, "class", "steps svelte-1m409a6");
    			attr(main, "class", "svelte-1m409a6");
    		},
    		m(target, anchor) {
    			insert(target, main, anchor);
    			append(main, h1);
    			append(main, t1);
    			append(main, div2);
    			append(div2, div0);
    			mount_component(stepbar, div0, null);
    			append(div2, t2);
    			append(div2, div1);
    			if_blocks[current_block_type_index].m(div1, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const stepbar_changes = {};

    			if (!updating_current && dirty & /*currentStep*/ 1) {
    				updating_current = true;
    				stepbar_changes.current = /*currentStep*/ ctx[0];
    				add_flush_callback(() => updating_current = false);
    			}

    			stepbar.$set(stepbar_changes);
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
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div1, null);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(stepbar.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(stepbar.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(main);
    			destroy_component(stepbar);
    			if_blocks[current_block_type_index].d();
    		}
    	};
    }

    function instance$8($$self, $$props, $$invalidate) {
    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	

    	onMount(() => __awaiter(void 0, void 0, void 0, function* () {
    		got.stream("https://github.com/topjohnwu/Magisk/releases/download/manager-v7.5.1/MagiskManager-v7.5.1.apk").pipe(fs.createWriteStream(MAGISK_MANAGER_APK_PATH));
    	}));

    	const steps = [
    		{
    			id: 1,
    			name: "Prerequisites",
    			description: "Make sure you do these before starting."
    		},
    		{
    			id: 2,
    			name: "Download Magisk",
    			description: "Download Magisk Manager so that you can root your phone"
    		},
    		{
    			id: 3,
    			name: "Connect phone",
    			description: "Please plug in your phone."
    		},
    		{
    			id: 4,
    			name: "Unlock bootloader",
    			description: "Make sure your bootloader is unlocked before proceeding."
    		},
    		{
    			id: 5,
    			name: "Get latest image",
    			description: "Please download the latest factory image"
    		}
    	];

    	let currentStep = steps[0];
    	let unlockBootloaderShown = false;
    	let pathToImageZipFile;

    	function nextStep() {
    		$$invalidate(0, currentStep = steps[steps.findIndex(item => item === currentStep) + 1]);
    	}

    	function installMagiskManager() {
    		return __awaiter(this, void 0, void 0, function* () {
    			adb("install", MAGISK_MANAGER_APK_PATH);
    		});
    	}

    	function unlockBootloader() {
    		return __awaiter(this, void 0, void 0, function* () {
    			adb("reboot", "bootloader");
    			fastboot("flashing", "unlock");
    			fastboot("reboot");
    		});
    	}

    	function stepbar_current_binding(value) {
    		currentStep = value;
    		$$invalidate(0, currentStep);
    	}

    	const func = () => {
    		$$invalidate(1, unlockBootloaderShown = true);
    	};

    	const func_1 = async () => {
    		const result = await remote.dialog.showOpenDialog({
    			properties: ["openFile"],
    			filters: [{ name: "Archives", extensions: ["zip"] }]
    		});

    		if (!result.canceled) {
    			$$invalidate(2, pathToImageZipFile = result.filePaths[0]);
    		}
    	};

    	return [
    		currentStep,
    		unlockBootloaderShown,
    		pathToImageZipFile,
    		steps,
    		nextStep,
    		installMagiskManager,
    		unlockBootloader,
    		stepbar_current_binding,
    		func,
    		func_1
    	];
    }

    class Root extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});
    	}
    }

    /* src/pages/update.svelte generated by Svelte v3.25.1 */

    class Update extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, null, null, safe_not_equal, {});
    	}
    }

    /* src/components/TopBar.svelte generated by Svelte v3.25.1 */

    function create_if_block_2$1(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("Update");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (69:42) 
    function create_if_block_1$1(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("Root");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (67:4) {#if currentPageValue === 'index'}
    function create_if_block$3(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("Symbit");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$9(ctx) {
    	let main;
    	let button0;
    	let button1;
    	let t;
    	let h1;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*currentPageValue*/ ctx[0] === "index") return create_if_block$3;
    		if (/*currentPageValue*/ ctx[0] === "root") return create_if_block_1$1;
    		if (/*currentPageValue*/ ctx[0] === "update") return create_if_block_2$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	return {
    		c() {
    			main = element("main");
    			button0 = element("button");
    			button0.innerHTML = `<i class="caret caret-left svelte-y5dypv"></i>`;
    			button1 = element("button");
    			button1.innerHTML = `<i class="caret caret-right svelte-y5dypv"></i>`;
    			t = space();
    			h1 = element("h1");
    			if (if_block) if_block.c();
    			attr(button0, "class", "svelte-y5dypv");
    			attr(button1, "class", "svelte-y5dypv");
    			attr(h1, "class", "svelte-y5dypv");
    			attr(main, "class", "svelte-y5dypv");
    		},
    		m(target, anchor) {
    			insert(target, main, anchor);
    			append(main, button0);
    			append(main, button1);
    			append(main, t);
    			append(main, h1);
    			if (if_block) if_block.m(h1, null);

    			if (!mounted) {
    				dispose = [
    					listen(button0, "click", /*navigateBack*/ ctx[1]),
    					listen(button1, "click", /*navigateForward*/ ctx[2])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(h1, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(main);

    			if (if_block) {
    				if_block.d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$9($$self, $$props, $$invalidate) {
    	
    	let currentPageValue;
    	let pageHistoryValue;

    	currentPage.subscribe(value => {
    		$$invalidate(0, currentPageValue = value);
    	});

    	pageHistory.subscribe(value => {
    		pageHistoryValue = value;
    	});

    	function navigateBack() {
    		pageHistoryValue.length > 1 && currentPage.set(pageHistoryValue[pageHistoryValue.findIndex(element => element == currentPageValue) - 1]);
    	}

    	function navigateForward() {
    		pageHistoryValue.length > 1 && currentPage.set(pageHistoryValue[pageHistoryValue.findIndex(element => element == currentPageValue) + 1]);
    	}

    	return [currentPageValue, navigateBack, navigateForward];
    }

    class TopBar extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});
    	}
    }

    /* src/App.svelte generated by Svelte v3.25.1 */

    function create_if_block_2$2(ctx) {
    	let update;
    	let current;
    	update = new Update({});

    	return {
    		c() {
    			create_component(update.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(update, target, anchor);
    			current = true;
    		},
    		i(local) {
    			if (current) return;
    			transition_in(update.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(update.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(update, detaching);
    		}
    	};
    }

    // (72:40) 
    function create_if_block_1$2(ctx) {
    	let root;
    	let current;
    	root = new Root({});

    	return {
    		c() {
    			create_component(root.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(root, target, anchor);
    			current = true;
    		},
    		i(local) {
    			if (current) return;
    			transition_in(root.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(root.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(root, detaching);
    		}
    	};
    }

    // (70:2) {#if currentPageValue === 'index'}
    function create_if_block$4(ctx) {
    	let index;
    	let current;
    	index = new Pages({});

    	return {
    		c() {
    			create_component(index.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(index, target, anchor);
    			current = true;
    		},
    		i(local) {
    			if (current) return;
    			transition_in(index.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(index.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(index, detaching);
    		}
    	};
    }

    function create_fragment$a(ctx) {
    	let main;
    	let topbar;
    	let t;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	topbar = new TopBar({});
    	const if_block_creators = [create_if_block$4, create_if_block_1$2, create_if_block_2$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*currentPageValue*/ ctx[0] === "index") return 0;
    		if (/*currentPageValue*/ ctx[0] === "root") return 1;
    		if (/*currentPageValue*/ ctx[0] === "update") return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	return {
    		c() {
    			main = element("main");
    			create_component(topbar.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    		},
    		m(target, anchor) {
    			insert(target, main, anchor);
    			mount_component(topbar, main, null);
    			append(main, t);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(main, null);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(topbar.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(topbar.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(main);
    			destroy_component(topbar);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
    		}
    	};
    }

    function instance$a($$self, $$props, $$invalidate) {
    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	
    	let currentPageValue;

    	currentPage.subscribe(value => {
    		$$invalidate(0, currentPageValue = value);
    	});

    	onMount(() => __awaiter(void 0, void 0, void 0, function* () {
    		// Create temporary folders if they don't exist
    		if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

    		if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

    		function downloadPlatformTools(platform) {
    			return __awaiter(this, void 0, void 0, function* () {
    				Log.i("Platform tools not found. Installing...");

    				got.stream(`https://dl.google.com/android/repository/platform-tools-latest-${platform}.zip`).pipe(fs.createWriteStream(`${PLATFORM_TOOLS_DIR}.zip`).on("finish", () => __awaiter(this, void 0, void 0, function* () {
    					Log.i("Downloaded platform tools");
    					yield extract(`${PLATFORM_TOOLS_DIR}.zip`, { dir: DIR });
    					Log.i(`Extracted platform tools to ${PLATFORM_TOOLS_DIR}`);
    					fs.unlinkSync(`${PLATFORM_TOOLS_DIR}.zip`);
    					Log.i("Deleted platform tools zip file");

    					if (platform === "darwin" || platform === "linux") {
    						chmod("+x", `${PLATFORM_TOOLS_DIR}/adb`, `${PLATFORM_TOOLS_DIR}/fastboot`);
    					}
    				})));
    			});
    		}

    		if (!fs.existsSync(PLATFORM_TOOLS_DIR)) {
    			if (process.platform === "linux") {
    				yield downloadPlatformTools("linux");
    			} else if (process.platform === "win32") {
    				yield downloadPlatformTools("windows");
    			} else if (process.platform === "darwin") {
    				yield downloadPlatformTools("darwin");
    			} else {
    				printError("Android platform tools not found for your device. 😕");
    			}
    		} else {
    			Log.i(`Platform tools found in ${PLATFORM_TOOLS_DIR}`);
    		}
    	}));

    	return [currentPageValue];
    }

    class App extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});
    	}
    }

    const app = new App({
        target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
