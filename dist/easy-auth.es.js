var Me = Object.defineProperty;
var _e = (t, e, n) => e in t ? Me(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n;
var f = (t, e, n) => _e(t, typeof e != "symbol" ? e + "" : e, n);
import { CognitoIdentityProviderClient as w, ConfirmDeviceCommand as Be, InitiateAuthCommand as fe, RespondToAuthChallengeCommand as O, AssociateSoftwareTokenCommand as be, RevokeTokenCommand as Oe, GlobalSignOutCommand as Ve, VerifySoftwareTokenCommand as pe, ConfirmForgotPasswordCommand as Ke, ForgotPasswordCommand as $e, ChangePasswordCommand as We, GetUserCommand as Ee, SetUserMFAPreferenceCommand as He, ListDevicesCommand as Ge, SignUpCommand as Le, ConfirmSignUpCommand as qe, ResendConfirmationCodeCommand as Ze, DeleteUserCommand as Je } from "@aws-sdk/client-cognito-identity-provider";
import C from "sjcl-aws";
class p extends Error {
  constructor({ message: e, name: n }) {
    super(e), this.name = n;
  }
}
class je {
  constructor() {
    f(this, "storage", /* @__PURE__ */ new Map());
  }
  get length() {
    return this.storage.size;
  }
  key(e) {
    return e > this.length - 1 ? null : Array.from(this.storage.keys())[e];
  }
  getItem(e) {
    return this.storage.get(e) ?? null;
  }
  setItem(e, n) {
    this.storage.set(e, n);
  }
  removeItem(e) {
    this.storage.delete(e);
  }
  clear() {
    this.storage.clear();
  }
}
const ze = () => {
  try {
    if (typeof window < "u" && window.localStorage)
      return window.localStorage;
  } catch {
    console.log("localStorage not found, using inMemoryStorage as fallback");
  }
  return new je();
};
class Ye {
  constructor() {
    f(this, "storage");
    this.storage = ze();
  }
  getItem(e) {
    return this.storage.getItem(e);
  }
  setItem(e, n) {
    this.storage.setItem(e, n);
  }
  removeItem(e) {
    this.storage.removeItem(e);
  }
  clear() {
    this.storage.clear();
  }
}
/*! js-cookie v3.0.5 | MIT */
function W(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e];
    for (var s in n)
      t[s] = n[s];
  }
  return t;
}
var Qe = {
  read: function(t) {
    return t[0] === '"' && (t = t.slice(1, -1)), t.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
  },
  write: function(t) {
    return encodeURIComponent(t).replace(
      /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
      decodeURIComponent
    );
  }
};
function z(t, e) {
  function n(o, i, r) {
    if (!(typeof document > "u")) {
      r = W({}, e, r), typeof r.expires == "number" && (r.expires = new Date(Date.now() + r.expires * 864e5)), r.expires && (r.expires = r.expires.toUTCString()), o = encodeURIComponent(o).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
      var a = "";
      for (var c in r)
        r[c] && (a += "; " + c, r[c] !== !0 && (a += "=" + r[c].split(";")[0]));
      return document.cookie = o + "=" + t.write(i, o) + a;
    }
  }
  function s(o) {
    if (!(typeof document > "u" || arguments.length && !o)) {
      for (var i = document.cookie ? document.cookie.split("; ") : [], r = {}, a = 0; a < i.length; a++) {
        var c = i[a].split("="), l = c.slice(1).join("=");
        try {
          var d = decodeURIComponent(c[0]);
          if (r[d] = t.read(l, d), o === d)
            break;
        } catch {
        }
      }
      return o ? r[o] : r;
    }
  }
  return Object.create(
    {
      set: n,
      get: s,
      remove: function(o, i) {
        n(
          o,
          "",
          W({}, i, {
            expires: -1
          })
        );
      },
      withAttributes: function(o) {
        return z(this.converter, W({}, this.attributes, o));
      },
      withConverter: function(o) {
        return z(W({}, this.converter, o), this.attributes);
      }
    },
    {
      attributes: { value: Object.freeze(e) },
      converter: { value: Object.freeze(t) }
    }
  );
}
var H = z(Qe, { path: "/" });
class Xe {
  constructor() {
    f(this, "listeners");
    this.listeners = /* @__PURE__ */ new Map();
  }
  /**
   * Used internally to remove a Hub listener.
   *
   * @remarks
   * This private method is for internal use only. Instead of calling Hub.remove, call the result of Hub.listen.
   */
  _remove(e, n) {
    const s = this.listeners.get(e);
    if (!s) {
      console.log(`No listeners for ${e}`);
      return;
    }
    this.listeners.set(e, s.filter(({ callback: o }) => o !== n));
  }
  /**
   * Used to send a Hub event.
   *
   * @param channel - The channel on which the event will be broadcast
   * @param payload - The HubPayload
   */
  dispatch(e, n) {
    const s = {
      channel: e,
      payload: { ...n },
      patternInfo: []
    };
    try {
      this._toListeners(s);
    } catch (o) {
      console.log("dispatch error:", o);
    }
  }
  /**
   * Used to listen for Hub events.
   *
   * @param channel - The channel on which to listen
   * @param callback - The callback to execute when an event is received on the specified channel
   * @param listenerName - The name of the listener; defaults to "noname"
   * @returns A function which can be called to cancel the listener.
   */
  listen(e, n, s = "noname") {
    if (typeof n != "function")
      return () => {
      };
    let o = this.listeners.get(e);
    return o || (o = [], this.listeners.set(e, o)), o.push({
      name: s,
      callback: n
    }), () => this._remove(e, n);
  }
  _toListeners(e) {
    const { channel: n } = e, s = this.listeners.get(n);
    s && s.forEach((o) => {
      try {
        o.callback(e);
      } catch (i) {
        console.log("_toListeners error:", i);
      }
    });
  }
}
const Q = new Xe(), b = (t) => {
  const e = t.split(".");
  if (e.length !== 3)
    throw new p({
      name: "InvalidJWTTokenException",
      message: g.InvalidJWTTokenException
    });
  try {
    const s = e[1].replace(/-/g, "+").replace(/_/g, "/"), o = atob(s), i = decodeURIComponent(o.split("").map((a) => "%" + ("00" + a.charCodeAt(0).toString(16)).slice(-2)).join("")), r = JSON.parse(i);
    return {
      toString: () => t,
      payload: r
    };
  } catch (n) {
    throw new p({
      name: "InvalidJWTTokenException",
      message: g.InvalidJWTTokenPayloadException + ": " + n.message
    });
  }
}, Se = "CognitoIdentityServiceProvider", et = (t, e) => tt({
  accessToken: "accessToken",
  idToken: "idToken",
  clockDrift: "clockDrift",
  refreshToken: "refreshToken",
  deviceKey: "deviceKey",
  deviceGroupKey: "deviceGroupKey",
  randomPassword: "randomPassword",
  signInDetails: "signInDetails"
})(`${t}`, e), tt = (t) => {
  const e = Object.values(t);
  return (n, s) => e.reduce(
    (o, i) => ({
      ...o,
      [i]: `${n}${s ? `.${s}` : ""}.${i}`
    }),
    {}
  );
}, X = () => {
  var n;
  const t = (n = A.getConfig().Auth) == null ? void 0 : n.Cognito, { userPoolClientId: e } = t;
  return `${Se}.${e}.LastAuthUser`;
}, ee = () => {
  const t = V(), e = X();
  return t.getItem(e) ?? "username";
}, G = (t) => {
  var o;
  const e = (o = A.getConfig().Auth) == null ? void 0 : o.Cognito, { userPoolClientId: n } = e, s = t ?? ee();
  return et(
    Se,
    `${n}.${s}`
  );
}, V = () => A.keyValueStorage, B = (t, e) => {
  if (!e) return;
  V().setItem(t, e.toString());
}, nt = (t, e) => {
  if (!e) return;
  V().setItem(t, JSON.stringify(e));
}, st = (t, e, n = B) => {
  if (!e) return;
  const { deviceKey: s, deviceGroupKey: o, randomPassword: i } = e;
  n(t.deviceKey, s), n(t.deviceGroupKey, o), n(t.randomPassword, i);
}, te = async () => {
  const t = G(), e = X(), n = V();
  await Promise.all([
    n.removeItem(t.accessToken),
    n.removeItem(t.idToken),
    n.removeItem(t.clockDrift),
    n.removeItem(t.refreshToken),
    n.removeItem(t.signInDetails),
    n.removeItem(e)
  ]);
}, ot = (t) => {
  if (!t)
    throw new p({
      name: "InvalidAuthTokensException",
      message: g.InvalidAuthTokensException
    });
  te();
  const {
    accessToken: e,
    idToken: n,
    refreshToken: s,
    deviceMetadata: o,
    clockDrift: i,
    signInDetails: r
  } = t, a = t.username;
  B(X(), a);
  const c = G();
  B(c.accessToken, e.toString()), B(c.idToken, n == null ? void 0 : n.toString()), B(c.refreshToken, s == null ? void 0 : s.toString()), st(c, o, B), nt(c.signInDetails, r), B(c.clockDrift, `${i}`);
}, Ce = ({
  username: t,
  authenticationResult: e,
  newDeviceMetadata: n,
  signInDetails: s
}) => {
  if (!e.AccessToken)
    throw new p({
      name: "NoAccessTokenException",
      message: g.NoAccessTokenException
    });
  const o = b(e.AccessToken), i = (o.payload.iat || 0) * 1e3, r = (/* @__PURE__ */ new Date()).getTime(), a = i > 0 ? i - r : 0;
  let c, l, d = n;
  e.RefreshToken && (l = e.RefreshToken), e.IdToken && (c = b(e.IdToken)), ot({
    accessToken: o,
    idToken: c,
    refreshToken: l,
    clockDrift: a,
    deviceMetadata: d,
    username: t,
    signInDetails: s
  });
}, it = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], rt = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], at = "Caldera Derived Key", ct = "89ABCDEFabcdef", Z = (t) => t < 10 ? `0${t}` : t, we = () => {
  const t = /* @__PURE__ */ new Date(), e = it[t.getUTCDay()], n = rt[t.getUTCMonth()], s = t.getUTCDate(), o = Z(t.getUTCHours()), i = Z(t.getUTCMinutes()), r = Z(t.getUTCSeconds()), a = t.getUTCFullYear();
  return `${e} ${n} ${s} ${o}:${i}:${r} UTC ${a}`;
}, Te = (t, e, n, s, o) => {
  try {
    const i = new C.misc.hmac(t);
    return i.update(C.codec.utf8String.toBits(e)), i.update(C.codec.utf8String.toBits(n)), i.update(C.codec.base64.toBits(s)), i.update(C.codec.utf8String.toBits(o)), C.codec.base64.fromBits(i.digest());
  } catch {
    throw new Error("Failed to calculate signature due to invalid input.");
  }
}, _ = (t) => {
  let e = t.toString(16);
  const n = e.length % 2, s = ct.indexOf(e[0]);
  return n === 1 ? e = `0${e}` : s !== -1 && (e = `00${e}`), e;
}, Y = (t) => {
  const e = C.codec.hex.fromBits(
    C.hash.sha256.hash(t)
  );
  return `${new Array(64 - e.length).join("0")}${e}`;
}, J = (t) => Y(
  C.codec.hex.toBits(t)
), lt = (t, e) => C.misc.hkdf(
  C.codec.hex.toBits(t),
  128,
  C.codec.hex.toBits(e),
  at
), Ae = (t) => {
  const e = Math.ceil(t / 4);
  return C.random.randomWords(e, 0);
}, dt = () => {
  const t = Ae(40);
  return C.codec.base64.fromBits(t);
}, ut = (t) => C.codec.hex.fromBits(t), ht = (t) => {
  const e = C.codec.hex.toBits(t), n = C.hash.sha256.hash(e);
  return C.codec.hex.fromBits(n);
}, ce = (t) => {
  const e = C.codec.hex.toBits(t);
  return C.codec.base64.fromBits(e);
};
function u(t, e) {
  t != null && this.fromString(t, e);
}
function P() {
  return new u(null);
}
var F, gt = 244837814094590, le = (gt & 16777215) == 15715070;
function mt(t, e, n, s, o, i) {
  for (; --i >= 0; ) {
    var r = e * this[t++] + n[s] + o;
    o = Math.floor(r / 67108864), n[s++] = r & 67108863;
  }
  return o;
}
function ft(t, e, n, s, o, i) {
  for (var r = e & 32767, a = e >> 15; --i >= 0; ) {
    var c = this[t] & 32767, l = this[t++] >> 15, d = a * c + l * r;
    c = r * c + ((d & 32767) << 15) + n[s] + (o & 1073741823), o = (c >>> 30) + (d >>> 15) + a * l + (o >>> 30), n[s++] = c & 1073741823;
  }
  return o;
}
function pt(t, e, n, s, o, i) {
  for (var r = e & 16383, a = e >> 14; --i >= 0; ) {
    var c = this[t] & 16383, l = this[t++] >> 14, d = a * c + l * r;
    c = r * c + ((d & 16383) << 14) + n[s] + o, o = (c >> 28) + (d >> 14) + a * l, n[s++] = c & 268435455;
  }
  return o;
}
var de = typeof navigator < "u";
de && le && navigator.appName == "Microsoft Internet Explorer" ? (u.prototype.am = ft, F = 30) : de && le && navigator.appName != "Netscape" ? (u.prototype.am = mt, F = 26) : (u.prototype.am = pt, F = 28);
u.prototype.DB = F;
u.prototype.DM = (1 << F) - 1;
u.prototype.DV = 1 << F;
var ne = 52;
u.prototype.FV = Math.pow(2, ne);
u.prototype.F1 = ne - F;
u.prototype.F2 = 2 * F - ne;
var Et = "0123456789abcdefghijklmnopqrstuvwxyz", L = [], K, U;
K = 48;
for (U = 0; U <= 9; ++U)
  L[K++] = U;
K = 97;
for (U = 10; U < 36; ++U)
  L[K++] = U;
K = 65;
for (U = 10; U < 36; ++U)
  L[K++] = U;
function ue(t) {
  return Et.charAt(t);
}
function St(t, e) {
  var n = L[t.charCodeAt(e)];
  return n ?? -1;
}
function Ct(t) {
  for (var e = this.t - 1; e >= 0; --e)
    t[e] = this[e];
  t.t = this.t, t.s = this.s;
}
function wt(t) {
  this.t = 1, this.s = t < 0 ? -1 : 0, t > 0 ? this[0] = t : t < -1 ? this[0] = t + this.DV : this.t = 0;
}
function se(t) {
  var e = P();
  return e.fromInt(t), e;
}
function Tt(t, e) {
  var n;
  if (e == 16)
    n = 4;
  else if (e == 8)
    n = 3;
  else if (e == 2)
    n = 1;
  else if (e == 32)
    n = 5;
  else if (e == 4)
    n = 2;
  else
    throw new Error("Only radix 2, 4, 8, 16, 32 are supported");
  this.t = 0, this.s = 0;
  for (var s = t.length, o = !1, i = 0; --s >= 0; ) {
    var r = St(t, s);
    if (r < 0) {
      t.charAt(s) == "-" && (o = !0);
      continue;
    }
    o = !1, i == 0 ? this[this.t++] = r : i + n > this.DB ? (this[this.t - 1] |= (r & (1 << this.DB - i) - 1) << i, this[this.t++] = r >> this.DB - i) : this[this.t - 1] |= r << i, i += n, i >= this.DB && (i -= this.DB);
  }
  this.clamp(), o && u.ZERO.subTo(this, this);
}
function At() {
  for (var t = this.s & this.DM; this.t > 0 && this[this.t - 1] == t; )
    --this.t;
}
function vt(t) {
  if (this.s < 0)
    return "-" + this.negate().toString(t);
  var e;
  if (t == 16)
    e = 4;
  else if (t == 8)
    e = 3;
  else if (t == 2)
    e = 1;
  else if (t == 32)
    e = 5;
  else if (t == 4)
    e = 2;
  else
    throw new Error("Only radix 2, 4, 8, 16, 32 are supported");
  var n = (1 << e) - 1, s, o = !1, i = "", r = this.t, a = this.DB - r * this.DB % e;
  if (r-- > 0)
    for (a < this.DB && (s = this[r] >> a) > 0 && (o = !0, i = ue(s)); r >= 0; )
      a < e ? (s = (this[r] & (1 << a) - 1) << e - a, s |= this[--r] >> (a += this.DB - e)) : (s = this[r] >> (a -= e) & n, a <= 0 && (a += this.DB, --r)), s > 0 && (o = !0), o && (i += ue(s));
  return o ? i : "0";
}
function yt() {
  var t = P();
  return u.ZERO.subTo(this, t), t;
}
function It() {
  return this.s < 0 ? this.negate() : this;
}
function Pt(t) {
  var e = this.s - t.s;
  if (e != 0)
    return e;
  var n = this.t;
  if (e = n - t.t, e != 0)
    return this.s < 0 ? -e : e;
  for (; --n >= 0; )
    if ((e = this[n] - t[n]) != 0)
      return e;
  return 0;
}
function oe(t) {
  var e = 1, n;
  return (n = t >>> 16) != 0 && (t = n, e += 16), (n = t >> 8) != 0 && (t = n, e += 8), (n = t >> 4) != 0 && (t = n, e += 4), (n = t >> 2) != 0 && (t = n, e += 2), (n = t >> 1) != 0 && (t = n, e += 1), e;
}
function Dt() {
  return this.t <= 0 ? 0 : this.DB * (this.t - 1) + oe(this[this.t - 1] ^ this.s & this.DM);
}
function Ut(t, e) {
  var n;
  for (n = this.t - 1; n >= 0; --n)
    e[n + t] = this[n];
  for (n = t - 1; n >= 0; --n)
    e[n] = 0;
  e.t = this.t + t, e.s = this.s;
}
function xt(t, e) {
  for (var n = t; n < this.t; ++n)
    e[n - t] = this[n];
  e.t = Math.max(this.t - t, 0), e.s = this.s;
}
function Nt(t, e) {
  var n = t % this.DB, s = this.DB - n, o = (1 << s) - 1, i = Math.floor(t / this.DB), r = this.s << n & this.DM, a;
  for (a = this.t - 1; a >= 0; --a)
    e[a + i + 1] = this[a] >> s | r, r = (this[a] & o) << n;
  for (a = i - 1; a >= 0; --a)
    e[a] = 0;
  e[i] = r, e.t = this.t + i + 1, e.s = this.s, e.clamp();
}
function Rt(t, e) {
  e.s = this.s;
  var n = Math.floor(t / this.DB);
  if (n >= this.t) {
    e.t = 0;
    return;
  }
  var s = t % this.DB, o = this.DB - s, i = (1 << s) - 1;
  e[0] = this[n] >> s;
  for (var r = n + 1; r < this.t; ++r)
    e[r - n - 1] |= (this[r] & i) << o, e[r - n] = this[r] >> s;
  s > 0 && (e[this.t - n - 1] |= (this.s & i) << o), e.t = this.t - n, e.clamp();
}
function kt(t, e) {
  for (var n = 0, s = 0, o = Math.min(t.t, this.t); n < o; )
    s += this[n] - t[n], e[n++] = s & this.DM, s >>= this.DB;
  if (t.t < this.t) {
    for (s -= t.s; n < this.t; )
      s += this[n], e[n++] = s & this.DM, s >>= this.DB;
    s += this.s;
  } else {
    for (s += this.s; n < t.t; )
      s -= t[n], e[n++] = s & this.DM, s >>= this.DB;
    s -= t.s;
  }
  e.s = s < 0 ? -1 : 0, s < -1 ? e[n++] = this.DV + s : s > 0 && (e[n++] = s), e.t = n, e.clamp();
}
function Ft(t, e) {
  var n = this.abs(), s = t.abs(), o = n.t;
  for (e.t = o + s.t; --o >= 0; )
    e[o] = 0;
  for (o = 0; o < s.t; ++o)
    e[o + n.t] = n.am(0, s[o], e, o, 0, n.t);
  e.s = 0, e.clamp(), this.s != t.s && u.ZERO.subTo(e, e);
}
function Mt(t) {
  for (var e = this.abs(), n = t.t = 2 * e.t; --n >= 0; )
    t[n] = 0;
  for (n = 0; n < e.t - 1; ++n) {
    var s = e.am(n, e[n], t, 2 * n, 0, 1);
    (t[n + e.t] += e.am(n + 1, 2 * e[n], t, 2 * n + 1, s, e.t - n - 1)) >= e.DV && (t[n + e.t] -= e.DV, t[n + e.t + 1] = 1);
  }
  t.t > 0 && (t[t.t - 1] += e.am(n, e[n], t, 2 * n, 0, 1)), t.s = 0, t.clamp();
}
function _t(t, e, n) {
  var s = t.abs();
  if (!(s.t <= 0)) {
    var o = this.abs();
    if (o.t < s.t) {
      e != null && e.fromInt(0), n != null && this.copyTo(n);
      return;
    }
    n == null && (n = P());
    var i = P(), r = this.s, a = t.s, c = this.DB - oe(s[s.t - 1]);
    c > 0 ? (s.lShiftTo(c, i), o.lShiftTo(c, n)) : (s.copyTo(i), o.copyTo(n));
    var l = i.t, d = i[l - 1];
    if (d != 0) {
      var h = d * (1 << this.F1) + (l > 1 ? i[l - 2] >> this.F2 : 0), m = this.FV / h, S = (1 << this.F1) / h, I = 1 << this.F2, E = n.t, v = E - l, y = e ?? P();
      for (i.dlShiftTo(v, y), n.compareTo(y) >= 0 && (n[n.t++] = 1, n.subTo(y, n)), u.ONE.dlShiftTo(l, y), y.subTo(i, i); i.t < l; )
        i[i.t++] = 0;
      for (; --v >= 0; ) {
        var R = n[--E] == d ? this.DM : Math.floor(n[E] * m + (n[E - 1] + I) * S);
        if ((n[E] += i.am(0, R, n, v, 0, l)) < R)
          for (i.dlShiftTo(v, y), n.subTo(y, n); n[E] < --R; )
            n.subTo(y, n);
      }
      e != null && (n.drShiftTo(l, e), r != a && u.ZERO.subTo(e, e)), n.t = l, n.clamp(), c > 0 && n.rShiftTo(c, n), r < 0 && u.ZERO.subTo(n, n);
    }
  }
}
function Bt(t) {
  var e = P();
  return this.abs().divRemTo(t, null, e), this.s < 0 && e.compareTo(u.ZERO) > 0 && t.subTo(e, e), e;
}
function bt() {
  if (this.t < 1)
    return 0;
  var t = this[0];
  if (!(t & 1))
    return 0;
  var e = t & 3;
  return e = e * (2 - (t & 15) * e) & 15, e = e * (2 - (t & 255) * e) & 255, e = e * (2 - ((t & 65535) * e & 65535)) & 65535, e = e * (2 - t * e % this.DV) % this.DV, e > 0 ? this.DV - e : -e;
}
function Ot(t) {
  return this.compareTo(t) == 0;
}
function Vt(t, e) {
  for (var n = 0, s = 0, o = Math.min(t.t, this.t); n < o; )
    s += this[n] + t[n], e[n++] = s & this.DM, s >>= this.DB;
  if (t.t < this.t) {
    for (s += t.s; n < this.t; )
      s += this[n], e[n++] = s & this.DM, s >>= this.DB;
    s += this.s;
  } else {
    for (s += this.s; n < t.t; )
      s += t[n], e[n++] = s & this.DM, s >>= this.DB;
    s += t.s;
  }
  e.s = s < 0 ? -1 : 0, s > 0 ? e[n++] = s : s < -1 && (e[n++] = this.DV + s), e.t = n, e.clamp();
}
function Kt(t) {
  var e = P();
  return this.addTo(t, e), e;
}
function $t(t) {
  var e = P();
  return this.subTo(t, e), e;
}
function Wt(t) {
  var e = P();
  return this.multiplyTo(t, e), e;
}
function Ht(t) {
  var e = P();
  return this.divRemTo(t, e, null), e;
}
function $(t) {
  this.m = t, this.mp = t.invDigit(), this.mpl = this.mp & 32767, this.mph = this.mp >> 15, this.um = (1 << t.DB - 15) - 1, this.mt2 = 2 * t.t;
}
function Gt(t) {
  var e = P();
  return t.abs().dlShiftTo(this.m.t, e), e.divRemTo(this.m, null, e), t.s < 0 && e.compareTo(u.ZERO) > 0 && this.m.subTo(e, e), e;
}
function Lt(t) {
  var e = P();
  return t.copyTo(e), this.reduce(e), e;
}
function qt(t) {
  for (; t.t <= this.mt2; )
    t[t.t++] = 0;
  for (var e = 0; e < this.m.t; ++e) {
    var n = t[e] & 32767, s = n * this.mpl + ((n * this.mph + (t[e] >> 15) * this.mpl & this.um) << 15) & t.DM;
    for (n = e + this.m.t, t[n] += this.m.am(0, s, t, e, 0, this.m.t); t[n] >= t.DV; )
      t[n] -= t.DV, t[++n]++;
  }
  t.clamp(), t.drShiftTo(this.m.t, t), t.compareTo(this.m) >= 0 && t.subTo(this.m, t);
}
function Zt(t, e) {
  t.squareTo(e), this.reduce(e);
}
function Jt(t, e, n) {
  t.multiplyTo(e, n), this.reduce(n);
}
$.prototype.convert = Gt;
$.prototype.revert = Lt;
$.prototype.reduce = qt;
$.prototype.mulTo = Jt;
$.prototype.sqrTo = Zt;
function jt(t, e, n) {
  var s = t.bitLength(), o = se(1), i = new $(e), r;
  if (s <= 0)
    return o;
  s < 18 ? r = 1 : s < 48 ? r = 3 : s < 144 ? r = 4 : s < 768 ? r = 5 : r = 6;
  var a = [], c = r - 1, l = (1 << r) - 1, d = 3;
  if (a[1] = i.convert(this), r > 1) {
    var h = P();
    for (i.sqrTo(a[1], h); d <= l; )
      a[d] = P(), i.mulTo(h, a[d - 2], a[d]), d += 2;
  }
  var m = t.t - 1, S, I = !0, E = P(), v;
  for (s = oe(t[m]) - 1; m >= 0; ) {
    for (s >= c ? S = t[m] >> s - c & l : (S = (t[m] & (1 << s + 1) - 1) << c - s, m > 0 && (S |= t[m - 1] >> this.DB + s - c)), d = r; !(S & 1); )
      S >>= 1, --d;
    if ((s -= d) < 0 && (s += this.DB, --m), I)
      a[S].copyTo(o), I = !1;
    else {
      for (; d > 1; )
        i.sqrTo(o, E), i.sqrTo(E, o), d -= 2;
      d > 0 ? i.sqrTo(o, E) : (v = o, o = E, E = v), i.mulTo(E, a[S], o);
    }
    for (; m >= 0 && !(t[m] & 1 << s); )
      i.sqrTo(o, E), v = o, o = E, E = v, --s < 0 && (s = this.DB - 1, --m);
  }
  var y = i.revert(o);
  return n && n(null, y), y;
}
function zt() {
  return this.compareTo(u.ZERO) == 0;
}
u.prototype.copyTo = Ct;
u.prototype.fromInt = wt;
u.prototype.fromString = Tt;
u.prototype.clamp = At;
u.prototype.dlShiftTo = Ut;
u.prototype.drShiftTo = xt;
u.prototype.lShiftTo = Nt;
u.prototype.rShiftTo = Rt;
u.prototype.subTo = kt;
u.prototype.multiplyTo = Ft;
u.prototype.squareTo = Mt;
u.prototype.divRemTo = _t;
u.prototype.invDigit = bt;
u.prototype.addTo = Vt;
u.prototype.toString = vt;
u.prototype.abs = It;
u.prototype.negate = yt;
u.prototype.compareTo = Pt;
u.prototype.bitLength = Dt;
u.prototype.mod = Bt;
u.prototype.equals = Ot;
u.prototype.add = Kt;
u.prototype.subtract = $t;
u.prototype.multiply = Wt;
u.prototype.divide = Ht;
u.prototype.modPow = jt;
u.prototype.isZero = zt;
u.ZERO = se(0);
u.ONE = se(1);
var x = function(t, e) {
  return new u(t, e);
};
const Yt = "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6BF12FFA06D98A0864D87602733EC86A64521F2B18177B200CBBE117577A615D6C770988C0BAD946E208E24FA074E5AB3143DB5BFCE0FD108E4B82D120A93AD2CAFFFFFFFFFFFFFFFF";
class ie {
  constructor(e) {
    f(this, "poolName");
    f(this, "N");
    f(this, "g");
    f(this, "k");
    f(this, "saltToHashDevices");
    f(this, "verifierDevices");
    f(this, "randomPassword");
    f(this, "smallAValue");
    f(this, "largeAValue");
    f(this, "UValue");
    /**
     *
     */
    f(this, "generateRandomSmallA", () => {
      if (this.smallAValue = x(
        C.codec.hex.fromBits(C.random.randomWords(8, 0)),
        16
      ).mod(this.N), !this.smallAValue) throw new Error("Failed to generate smallAValue");
      return this.smallAValue.toString(16);
    });
    /**
     *
     */
    f(this, "calculateA", (e = this.generateRandomSmallA()) => {
      if (this.largeAValue = this.g.modPow(x(e, 16), this.N), this.largeAValue.mod(this.N).isZero()) throw new Error("Illegal parameter. A mod N cannot be 0.");
      return this.largeAValue.toString(16);
    });
    /**
     *
     */
    f(this, "calculateU", (e, n) => x(
      J(`${_(e)}${_(n)}`),
      16
    ));
    /**
     *
     */
    f(this, "getPasswordAuthenticationKey", (e, n, s, o) => {
      let i = x(s, 16), r = x(o, 16);
      if (i.mod(this.N).isZero()) throw new Error("B cannot be zero.");
      if (!this.largeAValue) throw new Error("largeAValue is undefined");
      if (this.UValue = this.calculateU(
        this.largeAValue,
        i
      ), this.UValue.isZero()) throw new Error("U cannot be zero.");
      const l = `${this.poolName}${e}:${n}`, d = Y(l), h = `${_(r)}${d}`, m = x(J(h), 16), S = this.g.modPow(m, this.N), I = i.subtract(
        this.k.multiply(S)
      );
      if (!this.smallAValue) throw new Error("smallAValue is undefined");
      const E = this.UValue.multiply(m), v = I.modPow(
        this.smallAValue.add(E),
        this.N
      ).mod(this.N);
      return lt(
        _(v),
        _(this.UValue)
      );
    });
    /**
     *
     */
    f(this, "generateHashDevice", (e, n) => {
      this.randomPassword = dt();
      const s = `${e}${n}:${this.randomPassword}`, o = Y(s), i = Ae(16), r = ut(i);
      return this.saltToHashDevices = _(
        x(r, 16)
      ), new Promise((a, c) => {
        (async () => {
          try {
            const l = ht(this.saltToHashDevices + o), d = x(l, 16), h = this.g.modPow(d, this.N);
            this.verifierDevices = _(h);
          } catch (l) {
            c(l);
          }
        })();
      });
    });
    this.poolName = e, this.N = x(Yt, 16), this.g = x("2", 16), this.k = x(
      J(`00${this.N.toString(16)}0${this.g.toString(16)}`),
      16
    ), this.saltToHashDevices = "", this.verifierDevices = "", this.randomPassword = "";
  }
}
const he = () => {
  throw new p({
    name: "InvalidUserPoolIdException",
    message: g.InvalidUserPoolIdException
  });
}, ve = (t) => {
  (typeof t != "string" || !t.includes("_")) && he();
  const e = t.split("_").map((n) => n.trim());
  return (e.length !== 2 || e[0] === "" || e[1] === "") && he(), e;
}, T = (t) => {
  const [e] = ve(t);
  return e;
}, re = (t) => {
  const [, e] = ve(t);
  return e;
}, ye = async (t, e, n) => {
  if (!e) return;
  const s = re(t), o = (e == null ? void 0 : e.DeviceKey) ?? "", i = (e == null ? void 0 : e.DeviceGroupKey) ?? "", r = T(t), a = new w({ region: r }), c = new ie(s);
  try {
    c.generateHashDevice(i, o);
  } catch {
    return;
  }
  const l = {
    Salt: ce(c.saltToHashDevices),
    PasswordVerifier: ce(c.verifierDevices)
  };
  try {
    const d = c.randomPassword, h = new Be({
      AccessToken: n,
      DeviceKey: o,
      DeviceSecretVerifierConfig: l
    });
    return await a.send(h), {
      deviceKey: o,
      deviceGroupKey: i,
      randomPassword: d
    };
  } catch {
    return;
  }
}, q = (t) => {
  const e = V(), n = G(t), s = e.getItem(n.deviceKey), o = e.getItem(n.deviceGroupKey), i = e.getItem(n.randomPassword);
  return i ? {
    deviceKey: s,
    deviceGroupKey: o,
    randomPassword: i
  } : void 0;
}, ae = () => {
  const t = V();
  try {
    const e = G(), n = t.getItem(e.accessToken);
    if (!n)
      throw new p({
        name: "NoSessionFoundException",
        message: g.NoSessionFoundException
      });
    const s = b(n), o = t.getItem(e.idToken), i = o ? b(o) : void 0, r = t.getItem(e.refreshToken) ?? void 0, a = t.getItem(e.clockDrift) ?? "0", c = Number.parseInt(a), l = t.getItem(e.signInDetails), d = {
      accessToken: s,
      idToken: i,
      refreshToken: r,
      deviceMetadata: q() ?? void 0,
      clockDrift: c,
      username: ee(),
      signInDetails: void 0
    };
    return l && (d.signInDetails = JSON.parse(l)), d;
  } catch {
    return null;
  }
}, Qt = (t) => {
  if ((t.message !== "Network error" || t.message !== "The Internet connection appears to be offline.") && te(), Q.dispatch("auth", {
    event: "tokenRefreshFailure",
    data: { err: t }
  }), t.name.startsWith("NotAuthorizedException"))
    return null;
  throw t;
}, Xt = async ({
  tokens: t,
  username: e
}) => {
  var n;
  try {
    const s = t.refreshToken;
    if (!s)
      throw new p({
        name: "MissingRefreshTokenException",
        message: g.MissingRefreshTokenException
      });
    const o = t.deviceMetadata;
    if (!o)
      throw new p({
        name: "MissingDeviceMetadataException",
        message: g.MissingDeviceMetadataException
      });
    const i = (n = A.getConfig().Auth) == null ? void 0 : n.Cognito, { userPoolId: r, userPoolClientId: a } = i, c = T(r), l = new w({ region: c }), d = new fe({
      ClientId: a,
      AuthFlow: "REFRESH_TOKEN_AUTH",
      AuthParameters: {
        REFRESH_TOKEN: s,
        DEVICE_KEY: o.deviceKey
      }
    }), {
      AuthenticationResult: h
    } = await l.send(d), m = b((h == null ? void 0 : h.AccessToken) ?? ""), S = h != null && h.IdToken ? b(h.IdToken) : void 0, I = m.payload.iat;
    if (!I)
      throw new p({
        name: "iatNotFoundException",
        message: g.iatNotFoundException
      });
    const E = I * 1e3 - (/* @__PURE__ */ new Date()).getTime();
    return {
      accessToken: m,
      idToken: S,
      clockDrift: E,
      refreshToken: t.refreshToken,
      username: e
    };
  } catch (s) {
    return Qt(s);
  }
}, ge = (t, e) => Date.now() + e > t, k = async (t) => {
  var r, a, c, l;
  let e = ae();
  const n = ee();
  if (e === null)
    return null;
  const s = e != null && e.idToken ? ge(
    (((a = (r = e.idToken) == null ? void 0 : r.payload) == null ? void 0 : a.exp) ?? 0) * 1e3,
    e.clockDrift ?? 0
  ) : !0, o = e != null && e.accessToken ? ge(
    (((l = (c = e.accessToken) == null ? void 0 : c.payload) == null ? void 0 : l.exp) ?? 0) * 1e3,
    e.clockDrift ?? 0
  ) : !0;
  return ((t == null ? void 0 : t.forceRefresh) || s || o) && (e = await Xt({
    tokens: e,
    username: n
  }), e === null) ? null : {
    accessToken: e == null ? void 0 : e.accessToken,
    idToken: e == null ? void 0 : e.idToken,
    signInDetails: e == null ? void 0 : e.signInDetails
  };
}, en = async () => {
  var i;
  const t = await k({ forceRefresh: !1 });
  N(t);
  const {
    "cognito:username": e,
    sub: n
  } = ((i = t.idToken) == null ? void 0 : i.payload) ?? {}, s = {
    username: e,
    userId: n
  }, o = t.signInDetails;
  return o && (s.signInDetails = o), s;
}, j = (t) => typeof t == "string" && t.trim().length > 0, g = {
  InvalidConfigException: `
    Invalid or missing AWS Cognito configuration.

    This most likely occurred due to:
      1. EasyAuth.configure was not called before calling the method.

         EasyAuth.configure({
           Auth: {
             Cognito: {
               userPoolId: "your_user_pool_id",
               clientId: "your_client_id",
             }
           }
         });

         // ...

      2. The configuration object is missing 'userPoolId' or 'userPoolClientId'.
      3. The configuration object is not an object.`,
  UserAlreadyAuthenticatedException: "User is already authenticated.",
  EmptyChangePasswordException: "previousPassword and proposedPassword are required to change password.",
  EmptyUsernameException: "Username cannot be empty.",
  EmptyPasswordException: "Password cannot be empty.",
  EmptySignUpUsernameException: "Username is required to sign up.",
  EmptySignUpPasswordException: "Password is required to sign up.",
  EmptyResendSignUpCodeUsernameException: "Username is required to resend sign up code.",
  EmptyConfirmSignUpUsernameException: "Username is required to confirm sign up.",
  EmptyConfirmSignUpCodeException: "Code is required to confirm sign up.",
  EmptyUserIdForSRPException: "USER_ID_FOR_SRP was not found in challengeParameters.",
  InvalidUserPoolIdException: "Invalid user pool id provided.",
  MissingChallengeNameException: "Challenge name is missing from the authentication response.",
  MissingChallengeParametersException: "Challenge parameters are missing from the authentication response.",
  MissingSecretCodeException: "SecretCode is missing from the AssociateSoftwareTokenCommand.",
  InvalidAuthTokensException: "Invalid authentication tokens.",
  InvalidChallengeResponseException: `
    You provided an invalid challenge response.

    This most likely occurred due to:
      1. The challenge response was not provied.
      2. The challenge response was an empty string.
      3. The challenge response was not a string.`,
  SignInException: `
    An error occurred during the sign in process.

    This most likely occurred due to:
      1. signIn was not called before confirmSignIn.
      2. signIn threw an exception.
      3. page was refreshed during the sign in flow.`,
  InvalidMFASetupTypeException: "Invalid MFA setup type.",
  NoAccessTokenException: "No access token was found in the authentication result.",
  InvalidJWTTokenException: "Invalid JWT token provided, could not decode token.",
  InvalidJWTTokenPayloadException: "Invalid JWT payload",
  DeviceMetadataException: "'deviceKey', 'deviceGroupKey' or 'randomPassword' not found in local storage during the sign-in process..",
  UserUnauthenticatedException: "User needs to be authenticated to call this API.",
  iatNotFoundException: "iat not found in access token.",
  MissingRefreshTokenException: "Unable to refresh tokens: refresh token not provided.",
  MissingDeviceMetadataException: "Unable to refresh tokens: device metadata not provided.",
  ClientSignOutErrorException: "An error occurred during the client sign out process.",
  GlobalSignOutErrorException: "An error occurred during the global sign out process.",
  EmptyVerifyTOTPCodeException: "Code cannot be empty.",
  InvalidSameSiteValueException: 'The sameSite value of cookieStorage must be "lax", "strict" or "none".',
  SameSiteNoneRequiresSequreException: "sameSite = None requires the Secure attribute in latest browser versions."
}, D = (t, e, n) => {
  if (!t)
    throw new p({ name: e, message: n });
}, tn = async () => {
  let t = null;
  try {
    t = await en();
  } catch {
  }
  if (t && t.userId && t.username)
    throw new p({
      name: "UserAlreadyAuthenticatedException",
      message: g.UserAlreadyAuthenticatedException
    });
};
function nn(t) {
  if (!((t != null && t.accessToken || t != null && t.idToken) && (t != null && t.refreshToken)))
    throw new p({
      name: "UserUnauthenticatedException",
      message: g.UserUnauthenticatedException
    });
}
function Ie(t) {
  if (!(!!t && j(t.deviceKey) && j(t.deviceGroupKey) && j(t.randomPassword)))
    throw new p({
      name: "DeviceMetadataException",
      message: g.DeviceMetadataException
    });
}
function N(t) {
  const e = t == null ? void 0 : t.accessToken;
  if (!(e && e.payload && e.toString()))
    throw new p({
      name: "UserUnauthenticatedException",
      message: g.UserUnauthenticatedException
    });
}
class On {
  constructor(e = {}) {
    f(this, "path");
    f(this, "domain");
    f(this, "expires");
    f(this, "secure");
    f(this, "sameSite");
    const { path: n, domain: s, expires: o, secure: i, sameSite: r } = e;
    if (this.path = n || "/", this.domain = s, this.expires = Object.prototype.hasOwnProperty.call(e, "expires") ? o : 365, this.secure = Object.prototype.hasOwnProperty.call(e, "secure") ? i : !0, !!Object.prototype.hasOwnProperty.call(e, "sameSite")) {
      if (!r || !["strict", "lax", "none"].includes(r))
        throw new p({
          name: "InvalidSameSiteValueException",
          message: g.InvalidSameSiteValueException
        });
      if (r === "none" && !this.secure)
        throw new p({
          name: "SameSiteNoneRequiresSequreException",
          message: g.SameSiteNoneRequiresSequreException
        });
      this.sameSite = r;
    }
  }
  getItem(e) {
    return H.get(e) ?? null;
  }
  setItem(e, n) {
    H.set(e, n, this.getData());
  }
  removeItem(e) {
    H.remove(e, this.getData());
  }
  clear() {
    const e = H.get();
    Object.keys(e).forEach((n) => this.removeItem(n));
  }
  getData() {
    return {
      path: this.path,
      domain: this.domain,
      expires: this.expires,
      secure: this.secure,
      ...this.sameSite && { sameSite: this.sameSite }
    };
  }
}
class sn {
  constructor() {
    f(this, "resourcesConfig", {});
    f(this, "keyValueStorage", new Ye());
    f(this, "getConfig", () => {
      if (Object.keys(this.resourcesConfig).length === 0)
        throw new p({
          name: "InvalidConfigException",
          message: g.InvalidConfigException
        });
      return this.validateConfig(this.resourcesConfig), this.resourcesConfig;
    });
    /**
     * Example usage:
     *
     * EasyAuth.configure({
     *   Auth: {
     *     Cognito: {
     *       userPoolId: "your_user_pool_id",
     *       clientId: "your_client_id",
     *     }
     *   }
     * });
     *
     */
    f(this, "configure", (e) => {
      this.validateConfig(e), this.resourcesConfig = e;
    });
  }
  validateConfig(e) {
    var s;
    const n = (s = e.Auth) == null ? void 0 : s.Cognito;
    if (!(n != null && n.userPoolId) || !(n != null && n.userPoolClientId))
      throw new p({
        name: "InvalidConfigException",
        message: g.InvalidConfigException
      });
  }
  setKeyValueStorage(e) {
    this.keyValueStorage = e;
  }
}
const A = new sn(), on = async (t) => {
  const e = await k(t);
  N(e);
  const n = e.accessToken.payload.sub;
  return { tokens: e, sub: n };
}, Pe = () => ({
  username: "",
  challengeName: void 0,
  signInSession: void 0,
  signInDetails: void 0
}), rn = (t, e) => {
  switch (e.type) {
    case "SET_CHALLENGE_NAME":
      return {
        ...t,
        challengeName: e.value
      };
    case "SET_SIGN_IN_SESSION":
      return {
        ...t,
        signInSession: e.value
      };
    case "SET_USERNAME":
      return {
        ...t,
        username: e.value
      };
    case "SET_SIGN_IN_STATE":
      return { ...e.value };
    case "SET_INITIAL_STATE":
      return Pe();
    default:
      return t;
  }
}, an = (t) => {
  const e = Pe();
  let n = t(e, { type: "SET_INITIAL_STATE" });
  return {
    getState: () => n,
    dispatch: (s) => {
      n = t(n, s);
    }
  };
}, De = (t) => {
  M.dispatch({
    type: "SET_SIGN_IN_STATE",
    value: t
  });
}, Ue = () => {
  M.dispatch({
    type: "SET_INITIAL_STATE"
  });
}, M = an(rn), cn = (t) => {
  const { dispatch: e } = M;
  e({ type: "SET_USERNAME", value: t });
}, ln = (t) => M.getState().username ?? t, dn = (t) => {
  if (t === "PasswordResetRequiredException")
    return {
      isSignedIn: !1,
      nextStep: { signInStep: "RESET_PASSWORD" }
    };
}, xe = (t) => {
  if (t === "SMS_MFA") return "SMS";
  if (t === "SOFTWARE_TOKEN_MFA") return "TOTP";
}, Ne = (t) => {
  if (t)
    return t.map(xe).filter(Boolean);
}, un = (t) => t ? JSON.parse(t) : [], hn = (t, e) => {
  const { MFAS_CAN_SETUP: n } = t, s = un(n), o = Ne(s);
  return o == null ? void 0 : o.includes(e);
}, gn = (t, e) => ({
  sharedSecret: t,
  getSetupUri: (n, s) => `otpauth://totp/${n}:${s ?? e}?secret=${t}&issuer=${n}`
}), mn = async ({
  username: t,
  client: e,
  srp: n,
  challengeParameters: s,
  session: o,
  cognitoConfig: i
}) => {
  const { userPoolClientId: r } = i, a = q(t);
  Ie(a);
  const {
    deviceKey: c,
    deviceGroupKey: l,
    randomPassword: d
  } = a, {
    SRP_B: h,
    SALT: m,
    SECRET_BLOCK: S
  } = s, I = we(), E = n.getPasswordAuthenticationKey(c, d, h, m), v = Te(E, l, c, S, I), y = {
    USERNAME: (s == null ? void 0 : s.USERNAME) ?? t,
    PASSWORD_CLAIM_SECRET_BLOCK: S,
    TIMESTAMP: I,
    PASSWORD_CLAIM_SIGNATURE: v,
    DEVICE_KEY: c
  }, R = new O({
    ChallengeName: "DEVICE_PASSWORD_VERIFIER",
    ChallengeResponses: y,
    ClientId: r,
    Session: o
  });
  return await e.send(R);
}, fn = async (t, e) => {
  const n = q(t);
  Ie(n);
  const { userPoolId: s, userPoolClientId: o } = e, i = T(s), r = new w({ region: i }), a = new ie(n.deviceGroupKey), c = a.calculateA(), l = new O({
    ChallengeName: "DEVICE_SRP_AUTH",
    ChallengeResponses: {
      USERNAME: t,
      SRP_A: c,
      DEVICE_KEY: n.deviceKey
    },
    ClientId: o
  }), {
    ChallengeParameters: d,
    Session: h
  } = await r.send(l);
  if (!d)
    throw new p({
      name: "MissingChallengeParametersException",
      message: g.MissingChallengeParametersException
    });
  return await mn({
    username: t,
    client: r,
    srp: a,
    challengeParameters: d,
    session: h,
    cognitoConfig: e
  });
}, pn = async ({
  username: t,
  password: e,
  cognitoConfig: n
}) => {
  const { userPoolId: s, userPoolClientId: o } = n, i = re(s), r = T(s), a = new w({ region: r }), c = new ie(i), l = c.calculateA(), d = new fe({
    AuthFlow: "USER_SRP_AUTH",
    AuthParameters: {
      USERNAME: t,
      SRP_A: l
    },
    ClientId: o
  }), {
    ChallengeName: h,
    ChallengeParameters: m,
    Session: S
  } = await a.send(d);
  if (!(m && m.SRP_B && m.SALT && m.SECRET_BLOCK))
    throw new p({
      name: "MissingChallengeParametersException",
      message: g.MissingChallengeParametersException
    });
  const E = m.USERNAME ?? t;
  if (cn(E), !h)
    throw new p({
      name: "MissingChallengeNameException",
      message: g.MissingChallengeNameException
    });
  const v = await En({
    challengeName: h,
    cognitoConfig: n,
    client: a,
    srp: c,
    password: e,
    challengeParameters: m,
    session: S
  });
  return v.ChallengeName === "DEVICE_SRP_AUTH" ? fn(E, n) : v;
}, En = async ({
  challengeName: t,
  cognitoConfig: e,
  client: n,
  srp: s,
  password: o,
  challengeParameters: i,
  session: r
}) => {
  const { userPoolId: a, userPoolClientId: c } = e, l = re(a), {
    SRP_B: d,
    SALT: h,
    SECRET_BLOCK: m
  } = i, S = i.USER_ID_FOR_SRP;
  if (!S)
    throw new p({
      name: "EmptyUserIdForSRPException",
      message: g.EmptyUserIdForSRPException
    });
  const I = we(), E = s.getPasswordAuthenticationKey(S, o, d, h), v = Te(E, l, S, m, I), y = {
    USERNAME: S,
    PASSWORD_CLAIM_SECRET_BLOCK: m,
    TIMESTAMP: I,
    PASSWORD_CLAIM_SIGNATURE: v
  }, R = q(S);
  R && R.deviceKey && (y.DEVICE_KEY = R.deviceKey);
  const Fe = new O({
    ChallengeName: t,
    ChallengeResponses: y,
    ClientId: c,
    Session: r
  });
  return await n.send(Fe);
}, Sn = (t) => {
  if (!t) return [];
  const e = "userAttributes.";
  let n;
  try {
    n = JSON.parse(t);
  } catch {
    return [];
  }
  return Array.isArray(n) ? n.map(
    (s) => s.startsWith(e) ? s.replace(e, "") : s
  ) : [];
}, Cn = (t) => ({
  isSignedIn: !1,
  nextStep: {
    signInStep: "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED",
    missingAttributes: Sn(t.requiredAttributes)
  }
}), wn = async (t) => {
  var h;
  const { signInSession: e, username: n } = M.getState(), s = (h = A.getConfig().Auth) == null ? void 0 : h.Cognito, { userPoolId: o } = s, i = T(o);
  if (!hn(t, "TOTP"))
    throw new p({
      name: "SignInException",
      message: g.InvalidMFASetupTypeException + ": TOTP"
    });
  const a = new w({ region: i }), c = new be({
    Session: e
  }), {
    SecretCode: l,
    Session: d
  } = await a.send(c);
  if (!l)
    throw new p({
      name: "MissingSecretCodeException",
      message: g.MissingSecretCodeException
    });
  return M.dispatch({
    type: "SET_SIGN_IN_SESSION",
    value: d
  }), {
    isSignedIn: !1,
    nextStep: {
      signInStep: "CONTINUE_SIGN_IN_WITH_TOTP_SETUP",
      totpSetupDetails: gn(l, n)
    }
  };
}, Tn = () => ({
  isSignedIn: !1,
  nextStep: {
    signInStep: "CONFIRM_SIGN_IN_WITH_TOTP_CODE"
  }
}), An = {
  NEW_PASSWORD_REQUIRED: Cn,
  MFA_SETUP: wn,
  SOFTWARE_TOKEN_MFA: Tn
}, Re = (t, e) => {
  const n = An[t ?? ""];
  if (n) return n(e);
  throw new p({
    name: "ChallengeNotHandledException",
    message: `No next step for challenge: ${t}`
  });
}, vn = async (t) => {
  const { username: e, password: n } = t, s = {
    loginId: e,
    authFlowType: "USER_SRP_AUTH"
  };
  D(!!e, "EmptyUsernameException", g.EmptyUsernameException), D(!!n, "EmptyPasswordException", g.EmptyPasswordException);
  try {
    const o = A.getConfig().Auth.Cognito, {
      ChallengeName: i,
      ChallengeParameters: r,
      AuthenticationResult: a,
      Session: c
    } = await pn({
      username: e,
      password: n,
      cognitoConfig: o
    }), l = ln(e);
    if (De({
      signInSession: c,
      username: l,
      challengeName: i,
      signInDetails: s
    }), a)
      return Ue(), Ce({
        username: l,
        authenticationResult: a,
        newDeviceMetadata: await ye(
          o.userPoolId,
          a.NewDeviceMetadata,
          a.AccessToken
        ),
        signInDetails: s
      }), Q.dispatch("auth", {
        event: "signedIn",
        data: await on()
      }), {
        isSignedIn: !0,
        nextStep: { signInStep: "DONE" }
      };
    if (!i)
      throw new p({
        name: "MissingChallengeNameException",
        message: g.MissingChallengeNameException
      });
    return Re(
      i,
      r
    );
  } catch (o) {
    const i = dn(o.name);
    if (i) return i;
    throw o;
  }
}, Vn = async (t) => {
  var n;
  const e = (n = t.options) == null ? void 0 : n.authFlowType;
  switch (await tn(), e) {
    default:
      return vn(t);
  }
}, Kn = async (t) => {
  var s;
  const e = (s = A.getConfig().Auth) == null ? void 0 : s.Cognito;
  (t == null ? void 0 : t.isGlobal) ? await In(e) : await yn(e), te(), Q.dispatch("auth", {
    event: "signedOut"
  });
}, yn = async (t) => {
  try {
    const e = ae();
    if (nn(e), !ke(e.accessToken)) return;
    const { userPoolId: s, userPoolClientId: o } = t, i = T(s), r = new w({ region: i }), a = new Oe({
      ClientId: o,
      Token: e.refreshToken
    });
    await r.send(a);
  } catch {
    console.log(g.ClientSignOutErrorException);
  }
}, In = async (t) => {
  try {
    const e = ae();
    if (N(e), !ke(e.accessToken)) return;
    const { userPoolId: s } = t, o = T(s), i = new w({ region: o }), r = new Ve({
      AccessToken: e.accessToken.toString()
    });
    await i.send(r);
  } catch {
    console.log(g.GlobalSignOutErrorException);
  }
}, ke = (t) => {
  var e;
  return !!((e = t == null ? void 0 : t.payload) != null && e.origin_jti);
}, Pn = (t) => {
  const e = "userAttributes.";
  return t ? Object.entries(t).reduce((n, [s, o]) => (o && (n[`${e}${s}`] = o), n), {}) : {};
}, Dn = async ({
  username: t,
  signInSession: e,
  challengeResponse: n,
  cognitoConfig: s,
  options: o
}) => {
  const { userPoolId: i, userPoolClientId: r } = s, a = T(i), c = new w({ region: a }), l = new O({
    ChallengeName: "NEW_PASSWORD_REQUIRED",
    ChallengeResponses: {
      ...Pn(o == null ? void 0 : o.requiredAttributes),
      NEW_PASSWORD: n,
      USERNAME: t
    },
    ClientId: r,
    Session: e
  });
  return await c.send(l);
}, Un = async ({
  username: t,
  signInSession: e,
  challengeResponse: n,
  cognitoConfig: s
}) => {
  const { userPoolId: o, userPoolClientId: i } = s, r = T(o), a = new w({ region: r }), c = new pe({
    UserCode: n,
    Session: e
  }), {
    Session: l
  } = await a.send(c);
  M.dispatch({
    type: "SET_SIGN_IN_SESSION",
    value: l
  });
  const d = new O({
    ChallengeName: "MFA_SETUP",
    ChallengeResponses: {
      USERNAME: t
    },
    ClientId: i,
    Session: l
  });
  return a.send(d);
}, xn = async ({
  username: t,
  signInSession: e,
  challengeResponse: n,
  cognitoConfig: s
}) => {
  const { userPoolId: o, userPoolClientId: i } = s, r = T(o), a = new w({ region: r }), c = new O({
    ChallengeName: "SOFTWARE_TOKEN_MFA",
    ChallengeResponses: {
      USERNAME: t,
      SOFTWARE_TOKEN_MFA_CODE: n
    },
    ClientId: i,
    Session: e
  });
  return a.send(c);
}, Nn = {
  NEW_PASSWORD_REQUIRED: Dn,
  MFA_SETUP: Un,
  SOFTWARE_TOKEN_MFA: xn
}, Rn = async ({
  username: t,
  challengeName: e,
  signInSession: n,
  challengeResponse: s,
  cognitoConfig: o,
  options: i
}) => {
  const r = Nn[e];
  if (!r)
    throw new p({
      name: "UnknownChallengeException",
      message: `Unknown challenge: ${e}`
    });
  return await r({
    username: t,
    signInSession: n,
    challengeResponse: s,
    cognitoConfig: o,
    options: i
  });
}, $n = async (t) => {
  const { challengeResponse: e, options: n } = t, { username: s, challengeName: o, signInSession: i, signInDetails: r } = M.getState();
  if (D(
    !!e && typeof e == "string",
    "InvalidChallengeResponseException",
    g.InvalidChallengeResponseException
  ), D(
    !!s && !!i,
    "SignInException",
    g.SignInException
  ), !o)
    throw new p({
      name: "MissingChallengeNameException",
      message: g.MissingChallengeNameException
    });
  const a = A.getConfig().Auth.Cognito, {
    ChallengeName: c,
    ChallengeParameters: l,
    AuthenticationResult: d,
    Session: h
  } = await Rn({
    username: s,
    challengeName: o,
    signInSession: i,
    challengeResponse: e,
    cognitoConfig: a,
    options: n
  });
  return De({
    username: s,
    challengeName: c,
    signInSession: h,
    signInDetails: r
  }), d ? (Ue(), Ce({
    username: s,
    authenticationResult: d,
    newDeviceMetadata: await ye(
      a.userPoolId,
      d.NewDeviceMetadata,
      d.AccessToken
    ),
    signInDetails: r
  }), {
    isSignedIn: !0,
    nextStep: { signInStep: "DONE" }
  }) : Re(
    c,
    l
  );
}, Wn = async (t) => {
  var d;
  const e = (d = A.getConfig().Auth) == null ? void 0 : d.Cognito, { userPoolId: n, userPoolClientId: s } = e, { username: o, newPassword: i, confirmationCode: r } = t;
  D(
    !!o,
    "EmptyConfirmResetPasswordUsernameException",
    g.EmptyConfirmResetPasswordUsernameException
  ), D(
    !!i,
    "EmptyConfirmResetPasswordNewPasswordException",
    g.EmptyConfirmResetPasswordNewPasswordException
  ), D(
    !!r,
    "EmptyConfirmResetPasswordConfirmationCodeException",
    g.EmptyConfirmResetPasswordConfirmationCodeException
  );
  const a = T(n), c = new w({ region: a }), l = new Ke({
    Username: o,
    ConfirmationCode: r,
    Password: i,
    ClientId: s
  });
  await c.send(l);
}, Hn = async (t) => {
  var d;
  const e = (d = A.getConfig().Auth) == null ? void 0 : d.Cognito, { userPoolId: n, userPoolClientId: s } = e, o = t.username;
  D(
    !!o,
    "EmptyResetPasswordUsernameException",
    g.EmptyResetPasswordUsernameException
  );
  const i = T(n), r = new w({ region: i }), a = new $e({
    Username: o,
    ClientId: s
  }), l = (await r.send(a)).CodeDeliveryDetails;
  return {
    isPasswordReset: !1,
    nextStep: {
      resetPasswordStep: "CONFIRM_RESET_PASSWORD_WITH_CODE",
      codeDeliveryDetails: {
        deliveryMedium: l == null ? void 0 : l.DeliveryMedium,
        destination: l == null ? void 0 : l.Destination,
        attributeName: l == null ? void 0 : l.AttributeName
      }
    }
  };
}, Gn = async (t) => {
  const { previousPassword: e, proposedPassword: n } = t, s = await k();
  N(s), D(
    !!e && !!n,
    "EmptyChangePasswordException",
    g.EmptyChangePasswordException
  );
  const o = A.getConfig().Auth.Cognito, { userPoolId: i } = o, r = T(i), a = new w({ region: r }), c = new We({
    PreviousPassword: e,
    ProposedPassword: n,
    AccessToken: s.accessToken.toString()
  });
  await a.send(c);
}, Ln = async () => {
  const t = await k();
  N(t);
  const e = A.getConfig().Auth.Cognito, { userPoolId: n } = e, s = T(n), o = new w({ region: s }), i = new Ee({
    AccessToken: t.accessToken.toString()
  }), {
    PreferredMfaSetting: r,
    UserMFASettingList: a
  } = await o.send(i);
  return {
    preferredMFASetting: xe(r),
    userMFASettingList: Ne(a)
  };
}, me = (t) => {
  if (t === "ENABLED")
    return {
      Enabled: !0
    };
  if (t === "DISABLED")
    return {
      Enabled: !1
    };
  if (t === "PREFERRED")
    return {
      Enabled: !0,
      PreferredMfa: !0
    };
  if (t === "NOT_PREFERRED")
    return {
      Enabled: !0,
      PreferredMfa: !1
    };
}, qn = async (t) => {
  const { sms: e, totp: n } = t, s = await k();
  N(s);
  const o = A.getConfig().Auth.Cognito, { userPoolId: i } = o, r = T(i), a = new w({ region: r }), c = new He({
    AccessToken: s.accessToken.toString(),
    SoftwareTokenMfaSettings: me(n),
    SMSMfaSettings: me(e)
  });
  await a.send(c);
}, kn = 60, Zn = async () => {
  const t = await k();
  N(t);
  const e = A.getConfig().Auth.Cognito, { userPoolId: n } = e, s = T(n), o = new w({ region: s }), i = new Ge({
    AccessToken: t.accessToken.toString(),
    Limit: kn
  });
  return await o.send(i);
}, Fn = (t) => {
  const e = {};
  return t == null || t.map(({ Name: n, Value: s }) => {
    n && (e[n] = s);
  }), e;
}, Jn = async () => {
  const t = await k();
  N(t);
  const e = A.getConfig().Auth.Cognito, { userPoolId: n } = e, s = T(n), o = new w({ region: s }), i = new Ee({
    AccessToken: t.accessToken.toString()
  }), {
    UserAttributes: r
  } = await o.send(i);
  return Fn(r);
}, jn = async (t) => {
  const { code: e, options: n } = t, s = await k();
  N(s), D(
    !!e,
    "EmptyVerifyTOTPCodeException",
    g.EmptyVerifyTOTPCodeException
  );
  const o = A.getConfig().Auth.Cognito, { userPoolId: i } = o, r = T(i), a = new w({ region: r }), c = new pe({
    AccessToken: s.accessToken.toString(),
    UserCode: e,
    FriendlyDeviceName: n == null ? void 0 : n.deviceName
  }), l = await a.send(c);
  return {
    status: l.Status,
    session: l.Session
  };
}, Mn = (t) => Object.entries(t).map(([e, n]) => ({
  Name: e,
  Value: n
})), zn = async (t) => {
  const { username: e, password: n, options: s } = t;
  D(
    !!e,
    "EmptySignUpUsernameException",
    g.EmptySignUpUsernameException
  ), D(
    !!n,
    "EmptySignUpPasswordException",
    g.EmptySignUpPasswordException
  );
  const o = A.getConfig().Auth.Cognito, { userPoolId: i, userPoolClientId: r } = o, a = T(i), c = new w({ region: a }), l = new Le({
    ClientId: r,
    Username: e,
    Password: n,
    UserAttributes: (s == null ? void 0 : s.userAttributes) && Mn(s == null ? void 0 : s.userAttributes)
  }), {
    UserConfirmed: d,
    CodeDeliveryDetails: h,
    UserSub: m
  } = await c.send(l);
  return d ? {
    isSignUpComplete: !0,
    nextStep: {
      signUpStep: "DONE"
    },
    userId: m
  } : {
    isSignUpComplete: !1,
    nextStep: {
      signUpStep: "CONFIRM_SIGN_UP",
      codeDeliveryDetails: {
        deliveryMedium: h == null ? void 0 : h.DeliveryMedium,
        destination: h == null ? void 0 : h.Destination,
        attributeName: h == null ? void 0 : h.AttributeName
      }
    },
    userId: m
  };
}, Yn = async (t) => {
  const { username: e, confirmationCode: n, options: s } = t;
  D(
    !!e,
    "EmptyConfirmSignUpUsernameException",
    g.EmptyConfirmSignUpUsernameException
  ), D(
    !!n,
    "EmptyConfirmSignUpCodeException",
    g.EmptyConfirmSignUpCodeException
  );
  const o = A.getConfig().Auth.Cognito, { userPoolId: i, userPoolClientId: r } = o, a = T(i), c = new w({ region: a }), l = new qe({
    ClientId: r,
    Username: e,
    ConfirmationCode: n,
    ForceAliasCreation: s == null ? void 0 : s.forceAliasCreation
  });
  return await c.send(l), {
    isSignUpComplete: !0,
    nextStep: {
      signUpStep: "DONE"
    }
  };
}, Qn = async (t) => {
  const { username: e } = t;
  D(
    !!e,
    "EmptyResendSignUpCodeUsernameException",
    g.EmptyResendSignUpCodeUsernameException
  );
  const n = A.getConfig().Auth.Cognito, { userPoolId: s, userPoolClientId: o } = n, i = T(s), r = new w({ region: i }), a = new Ze({
    Username: e,
    ClientId: o
  }), {
    CodeDeliveryDetails: c
  } = await r.send(a);
  return {
    destination: c == null ? void 0 : c.Destination,
    deliveryMedium: c == null ? void 0 : c.DeliveryMedium,
    attributeName: c == null ? void 0 : c.AttributeName
  };
}, Xn = async () => {
  const t = await k();
  N(t);
  const e = A.getConfig().Auth.Cognito, { userPoolId: n } = e, s = T(n), o = new w({ region: s }), i = new Je({
    AccessToken: t.accessToken.toString()
  });
  await o.send(i);
};
export {
  On as CookieStorage,
  Ye as DefaultStorage,
  A as EasyAuth,
  je as InMemoryStorage,
  Wn as confirmResetPassword,
  $n as confirmSignIn,
  Yn as confirmSignUp,
  Xn as deleteUser,
  on as getCurrentSession,
  en as getCurrentUser,
  Zn as getDevices,
  Ln as getMFAPreference,
  Jn as getUserAttributes,
  Qn as resendSignUpCode,
  Hn as resetPassword,
  Vn as signIn,
  Kn as signOut,
  zn as signUp,
  qn as updateMFAPreference,
  Gn as updatePassword,
  jn as verifyTOTP
};
