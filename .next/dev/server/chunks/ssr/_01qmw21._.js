module.exports = [
"[project]/.next-internal/server/app/login/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/auth/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "602a866ab6f3fcac3ab4af61cb1dac39d209b541d4",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$auth$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["login"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$login$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$auth$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/login/page/actions.js { ACTIONS_MODULE0 => "[project]/app/auth/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$auth$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/auth/actions.ts [app-rsc] (ecmascript)");
}),
"[project]/.next-internal/server/app/login/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/auth/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$auth$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/auth/actions.ts [app-rsc] (ecmascript)");
;
}),
"[project]/app/auth/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"00731c55d5502b327b60b8b5bd57d08f2b7d82b3b9":{"name":"logout"},"602a866ab6f3fcac3ab4af61cb1dac39d209b541d4":{"name":"login"}},"app/auth/actions.ts",""] */ __turbopack_context__.s([
    "login",
    ()=>login,
    "logout",
    ()=>logout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$credentials$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/credentials.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/session.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
;
function safeNextPath(value) {
    if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
    return value;
}
async function login(_, formData) {
    const email = formData.get("email");
    const password = formData.get("password");
    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
        return {
            error: "Enter your email and password."
        };
    }
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$credentials$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authenticate"])(email, password);
    if (!user) return {
        error: "The email or password is incorrect."
    };
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createSession"])(user.email, user.name);
    if (!session) return {
        error: "Authentication is not configured. Contact an administrator."
    };
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setSession"])(session);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(safeNextPath(formData.get("next")));
}
async function logout() {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["clearSession"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/login");
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    login,
    logout
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(login, "602a866ab6f3fcac3ab4af61cb1dac39d209b541d4", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(logout, "00731c55d5502b327b60b8b5bd57d08f2b7d82b3b9", null);
}),
"[project]/lib/auth/credentials.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "authenticate",
    ()=>authenticate,
    "isUsingLocalDemoCredentials",
    ()=>isUsingLocalDemoCredentials
]);
const LOCAL_DEMO_EMAIL = "admin@nightguard.local";
const LOCAL_DEMO_PASSWORD = "nightguard-demo";
function configuredCredentials() {
    const email = process.env.AUTH_USER_EMAIL;
    const password = process.env.AUTH_USER_PASSWORD;
    if (email && password) {
        return {
            user: {
                email,
                name: process.env.AUTH_USER_NAME ?? "NightGuard Administrator"
            },
            password
        };
    }
    if ("TURBOPACK compile-time truthy", 1) {
        return {
            user: {
                email: LOCAL_DEMO_EMAIL,
                name: "NightGuard Administrator"
            },
            password: LOCAL_DEMO_PASSWORD
        };
    }
    //TURBOPACK unreachable
    ;
}
function isUsingLocalDemoCredentials() {
    return !process.env.AUTH_USER_EMAIL && ("TURBOPACK compile-time value", "development") !== "production";
}
async function authenticate(email, password) {
    const configured = configuredCredentials();
    if (!configured) return null;
    return email.trim().toLowerCase() === configured.user.email.toLowerCase() && password === configured.password ? configured.user : null;
}
}),
"[project]/lib/auth/server.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearSession",
    ()=>clearSession,
    "getSession",
    ()=>getSession,
    "setSession",
    ()=>setSession
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/session.ts [app-rsc] (ecmascript)");
;
;
async function getSession() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["verifySession"])(cookieStore.get(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SESSION_COOKIE"])?.value);
}
async function setSession(value) {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
    cookieStore.set(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SESSION_COOKIE"], value, {
        httpOnly: true,
        sameSite: "lax",
        secure: ("TURBOPACK compile-time value", "development") === "production",
        path: "/",
        maxAge: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sessionMaxAge"])()
    });
}
async function clearSession() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
    cookieStore.delete(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SESSION_COOKIE"]);
}
}),
"[project]/lib/auth/session.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SESSION_COOKIE",
    ()=>SESSION_COOKIE,
    "createSession",
    ()=>createSession,
    "sessionMaxAge",
    ()=>sessionMaxAge,
    "verifySession",
    ()=>verifySession
]);
const SESSION_COOKIE = "nightguard_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;
function getSessionSecret() {
    const configuredSecret = process.env.AUTH_SESSION_SECRET;
    if (configuredSecret) return configuredSecret;
    // This lets a freshly cloned project run locally. Production deployments
    // must set a unique secret so sessions cannot be forged.
    return ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : "nightguard-local-development-secret";
}
function toBase64Url(value) {
    const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
    let binary = "";
    for (const byte of bytes)binary += String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function fromBase64UrlBytes(value) {
    try {
        const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
        const binary = atob(padded);
        return Uint8Array.from(binary, (character)=>character.charCodeAt(0));
    } catch  {
        return null;
    }
}
function fromBase64Url(value) {
    const bytes = fromBase64UrlBytes(value);
    return bytes ? new TextDecoder().decode(bytes) : null;
}
function toArrayBuffer(bytes) {
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    return copy.buffer;
}
async function signingKey() {
    const secret = getSessionSecret();
    if (!secret) return null;
    return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), {
        name: "HMAC",
        hash: "SHA-256"
    }, false, [
        "sign",
        "verify"
    ]);
}
async function createSession(email, name) {
    const key = await signingKey();
    if (!key) return null;
    const payload = {
        email,
        name,
        exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS
    };
    const encodedPayload = toBase64Url(JSON.stringify(payload));
    const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(encodedPayload));
    return `${encodedPayload}.${toBase64Url(new Uint8Array(signature))}`;
}
async function verifySession(value) {
    if (!value) return null;
    const [encodedPayload, encodedSignature, ...rest] = value.split(".");
    if (!encodedPayload || !encodedSignature || rest.length > 0) return null;
    const key = await signingKey();
    const signature = fromBase64UrlBytes(encodedSignature);
    const payload = fromBase64Url(encodedPayload);
    if (!key || !signature || !payload) return null;
    const valid = await crypto.subtle.verify("HMAC", key, toArrayBuffer(signature), new TextEncoder().encode(encodedPayload));
    if (!valid) return null;
    try {
        const parsed = JSON.parse(payload);
        if (typeof parsed.email !== "string" || typeof parsed.name !== "string" || typeof parsed.exp !== "number" || parsed.exp <= Math.floor(Date.now() / 1000)) {
            return null;
        }
        return {
            email: parsed.email,
            name: parsed.name,
            exp: parsed.exp
        };
    } catch  {
        return null;
    }
}
function sessionMaxAge() {
    return SESSION_DURATION_SECONDS;
}
}),
];

//# sourceMappingURL=_01qmw21._.js.map