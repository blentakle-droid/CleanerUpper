const painless = (() => {

  
    const get = (selector) => document.querySelector(selector);
    const getAll = (selector) => document.querySelectorAll(selector);

 
    const onClick = (el, fn) => {
        if (!el) return;
        el.addEventListener("click", fn);
    };

    const onKey = (targetKey, action) => {
        window.addEventListener("keydown", (event) => {
            if (event.key === targetKey) action();
        });
    };

   
    const delay = (ms, action) => {
        return setTimeout(action, ms);
    };

    const timer = (ms, action) => {
        return setInterval(action, ms);
    };

    const stop = (id) => {
        clearTimeout(id);
        clearInterval(id);
    };


    const change = (target, newType, newText = "") => {
        const oldEl = typeof target === "string"
            ? document.querySelector(target)
            : target;

        if (!oldEl) {
            console.warn(`Target "${target}" not found.`);
            return null;
        }

        const newEl = document.createElement(newType);
        newEl.textContent = newText;

        if (oldEl.id) newEl.id = oldEl.id;
        if (oldEl.className) newEl.className = oldEl.className;

        oldEl.replaceWith(newEl);
        return newEl;
    };


  const spawn = (type, parent, content = "", styles = {}) => {
    const el = document.createElement(type);
    el.innerHTML = content;
    
    // Apply the paint immediately
    paint(el, styles);
    
    const container = (typeof parent === "string") ? document.querySelector(parent) : parent;
    (container || document.body).appendChild(el);
    
    return el;
};
 
    const mouse = { x: 0, y: 0 };

    const trackMouse = () => {
        window.addEventListener("mousemove", (event) => {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
        });
    };

   
    const save = (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    };

    const load = (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    };

    const wipe = (key) => localStorage.removeItem(key);

   
    const alertPlus = (
        msg,
        bgColor = "#2f3542",
        textColor = "white",
        duration = 5000
    ) => {
        const box = document.createElement("div");

        box.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(-100px);
            background: ${bgColor};
            color: ${textColor};
            padding: 15px 30px;
            border-radius: 50px;
            font-family: 'Segoe UI', sans-serif;
            font-weight: bold;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            z-index: 99999;
            transition: transform 0.4s ease;
            cursor: pointer;
        `;

        box.textContent = msg;
        document.body.appendChild(box);

        // Animate in
        delay(10, () => {
            box.style.transform = "translateX(-50%) translateY(0)";
        });

        const removeBox = () => {
            box.style.transform = "translateX(-50%) translateY(-100px)";
            delay(400, () => box.remove());
        };

        onClick(box, removeBox);

        // Auto remove
        const timeoutId = delay(duration, removeBox);

        return {
            remove: removeBox,
            timeoutId
        };
    };
     const paint = (el, styles) => {
        if(!el) return;
         Object.assign(el.style, styles);
     }
     const each = (list, action) => {
        if (Array.isArray(list)) {
            list.forEach((item, index) => action(item, index));
        } else {
            console.log("Loop error: That is not a list!")
        }
     }
     const repeat = (times, action) => {
        for (let i = 1; i <= times; i++) {
        action(i);
    }

     }
      const find = (list, check) => list.find(check);
      
      const drag = (el) => {
         let active = false;

    el.addEventListener("mousedown", () => active = true);
    window.addEventListener("mouseup", () => active = false);

    window.addEventListener("mousemove", (e) => {
        if(active){
            el.style.left = e.clientX + "px";
            el.style.top = e.clientY + "px";
        }
    });
      }
    // ---------------------------
    // PUBLIC API
    // ---------------------------
    return {
        get,
        getAll,
        onClick,
        onKey,
        delay,
        timer,
        stop,
        change,
        spawn,
        mouse,
        trackMouse,
        save,
        load,
        wipe,
        alertPlus,
        paint,
        each,
        repeat,
        find,
        drag
    };

})();

// This lets people use "import { get } from 'painless-frontend'"
if (typeof module !== 'undefined' && module.exports) {
    module.exports = painless;
}

