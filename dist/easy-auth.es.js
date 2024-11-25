var ke = Object.defineProperty;
var Fe = (t, e, n) => e in t ? ke(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n;
var f = (t, e, n) => Fe(t, typeof e != "symbol" ? e + "" : e, n);
import W from "js-cookie";
import { CognitoIdentityProviderClient as w, ConfirmDeviceCommand as Me, InitiateAuthCommand as me, RespondToAuthChallengeCommand as O, AssociateSoftwareTokenCommand as _e, RevokeTokenCommand as be, GlobalSignOutCommand as Be, VerifySoftwareTokenCommand as ge, ConfirmForgotPasswordCommand as Oe, ForgotPasswordCommand as Ve, ChangePasswordCommand as Ke, GetUserCommand as fe, SetUserMFAPreferenceCommand as $e, ListDevicesCommand as We, SignUpCommand as He, ConfirmSignUpCommand as Ge, ResendConfirmationCodeCommand as Le, DeleteUserCommand as qe } from "@aws-sdk/client-cognito-identity-provider";
import C from "sjcl-aws";
class p extends Error {
  constructor({ message: e, name: n }) {
    super(e), this.name = n;
  }
}
class Ze {
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
const Je = () => {
  try {
    if (typeof window < "u" && window.localStorage)
      return window.localStorage;
  } catch {
    console.log("localStorage not found, using inMemoryStorage as fallback");
  }
  return new Ze();
};
class je {
  constructor() {
    f(this, "storage");
    this.storage = Je();
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
class ze {
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
const z = new ze(), B = (t) => {
  const e = t.split(".");
  if (e.length !== 3)
    throw new p({
      name: "InvalidJWTTokenException",
      message: m.InvalidJWTTokenException
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
      message: m.InvalidJWTTokenPayloadException + ": " + n.message
    });
  }
}, pe = "CognitoIdentityServiceProvider", Ye = (t, e) => Qe({
  accessToken: "accessToken",
  idToken: "idToken",
  clockDrift: "clockDrift",
  refreshToken: "refreshToken",
  deviceKey: "deviceKey",
  deviceGroupKey: "deviceGroupKey",
  randomPassword: "randomPassword",
  signInDetails: "signInDetails"
})(`${t}`, e), Qe = (t) => {
  const e = Object.values(t);
  return (n, s) => e.reduce(
    (o, i) => ({
      ...o,
      [i]: `${n}${s ? `.${s}` : ""}.${i}`
    }),
    {}
  );
}, Y = () => {
  var n;
  const t = (n = A.getConfig().Auth) == null ? void 0 : n.Cognito, { userPoolClientId: e } = t;
  return `${pe}.${e}.LastAuthUser`;
}, Q = () => {
  const t = V(), e = Y();
  return t.getItem(e) ?? "username";
}, H = (t) => {
  var o;
  const e = (o = A.getConfig().Auth) == null ? void 0 : o.Cognito, { userPoolClientId: n } = e, s = t ?? Q();
  return Ye(
    pe,
    `${n}.${s}`
  );
}, V = () => A.keyValueStorage, b = (t, e) => {
  if (!e) return;
  V().setItem(t, e.toString());
}, Xe = (t, e) => {
  if (!e) return;
  V().setItem(t, JSON.stringify(e));
}, et = (t, e, n = b) => {
  if (!e) return;
  const { deviceKey: s, deviceGroupKey: o, randomPassword: i } = e;
  n(t.deviceKey, s), n(t.deviceGroupKey, o), n(t.randomPassword, i);
}, X = async () => {
  const t = H(), e = Y(), n = V();
  await Promise.all([
    n.removeItem(t.accessToken),
    n.removeItem(t.idToken),
    n.removeItem(t.clockDrift),
    n.removeItem(t.refreshToken),
    n.removeItem(t.signInDetails),
    n.removeItem(e)
  ]);
}, tt = (t) => {
  if (!t)
    throw new p({
      name: "InvalidAuthTokensException",
      message: m.InvalidAuthTokensException
    });
  X();
  const {
    accessToken: e,
    idToken: n,
    refreshToken: s,
    deviceMetadata: o,
    clockDrift: i,
    signInDetails: r
  } = t, a = t.username;
  b(Y(), a);
  const c = H();
  b(c.accessToken, e.toString()), b(c.idToken, n == null ? void 0 : n.toString()), b(c.refreshToken, s == null ? void 0 : s.toString()), et(c, o, b), Xe(c.signInDetails, r), b(c.clockDrift, `${i}`);
}, Ee = ({
  username: t,
  authenticationResult: e,
  newDeviceMetadata: n,
  signInDetails: s
}) => {
  if (!e.AccessToken)
    throw new p({
      name: "NoAccessTokenException",
      message: m.NoAccessTokenException
    });
  const o = B(e.AccessToken), i = (o.payload.iat || 0) * 1e3, r = (/* @__PURE__ */ new Date()).getTime(), a = i > 0 ? i - r : 0;
  let c, l, d = n;
  e.RefreshToken && (l = e.RefreshToken), e.IdToken && (c = B(e.IdToken)), tt({
    accessToken: o,
    idToken: c,
    refreshToken: l,
    clockDrift: a,
    deviceMetadata: d,
    username: t,
    signInDetails: s
  });
}, nt = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], st = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], ot = "Caldera Derived Key", it = "89ABCDEFabcdef", q = (t) => t < 10 ? `0${t}` : t, Se = () => {
  const t = /* @__PURE__ */ new Date(), e = nt[t.getUTCDay()], n = st[t.getUTCMonth()], s = t.getUTCDate(), o = q(t.getUTCHours()), i = q(t.getUTCMinutes()), r = q(t.getUTCSeconds()), a = t.getUTCFullYear();
  return `${e} ${n} ${s} ${o}:${i}:${r} UTC ${a}`;
}, Ce = (t, e, n, s, o) => {
  try {
    const i = new C.misc.hmac(t);
    return i.update(C.codec.utf8String.toBits(e)), i.update(C.codec.utf8String.toBits(n)), i.update(C.codec.base64.toBits(s)), i.update(C.codec.utf8String.toBits(o)), C.codec.base64.fromBits(i.digest());
  } catch {
    throw new Error("Failed to calculate signature due to invalid input.");
  }
}, _ = (t) => {
  let e = t.toString(16);
  const n = e.length % 2, s = it.indexOf(e[0]);
  return n === 1 ? e = `0${e}` : s !== -1 && (e = `00${e}`), e;
}, j = (t) => {
  const e = C.codec.hex.fromBits(
    C.hash.sha256.hash(t)
  );
  return `${new Array(64 - e.length).join("0")}${e}`;
}, Z = (t) => j(
  C.codec.hex.toBits(t)
), rt = (t, e) => C.misc.hkdf(
  C.codec.hex.toBits(t),
  128,
  C.codec.hex.toBits(e),
  ot
), we = (t) => {
  const e = Math.ceil(t / 4);
  return C.random.randomWords(e, 0);
}, at = () => {
  const t = we(40);
  return C.codec.base64.fromBits(t);
}, ct = (t) => C.codec.hex.fromBits(t), lt = (t) => {
  const e = C.codec.hex.toBits(t), n = C.hash.sha256.hash(e);
  return C.codec.hex.fromBits(n);
}, re = (t) => {
  const e = C.codec.hex.toBits(t);
  return C.codec.base64.fromBits(e);
};
function h(t, e) {
  t != null && this.fromString(t, e);
}
function P() {
  return new h(null);
}
var F, dt = 244837814094590, ae = (dt & 16777215) == 15715070;
function ht(t, e, n, s, o, i) {
  for (; --i >= 0; ) {
    var r = e * this[t++] + n[s] + o;
    o = Math.floor(r / 67108864), n[s++] = r & 67108863;
  }
  return o;
}
function ut(t, e, n, s, o, i) {
  for (var r = e & 32767, a = e >> 15; --i >= 0; ) {
    var c = this[t] & 32767, l = this[t++] >> 15, d = a * c + l * r;
    c = r * c + ((d & 32767) << 15) + n[s] + (o & 1073741823), o = (c >>> 30) + (d >>> 15) + a * l + (o >>> 30), n[s++] = c & 1073741823;
  }
  return o;
}
function mt(t, e, n, s, o, i) {
  for (var r = e & 16383, a = e >> 14; --i >= 0; ) {
    var c = this[t] & 16383, l = this[t++] >> 14, d = a * c + l * r;
    c = r * c + ((d & 16383) << 14) + n[s] + o, o = (c >> 28) + (d >> 14) + a * l, n[s++] = c & 268435455;
  }
  return o;
}
var ce = typeof navigator < "u";
ce && ae && navigator.appName == "Microsoft Internet Explorer" ? (h.prototype.am = ut, F = 30) : ce && ae && navigator.appName != "Netscape" ? (h.prototype.am = ht, F = 26) : (h.prototype.am = mt, F = 28);
h.prototype.DB = F;
h.prototype.DM = (1 << F) - 1;
h.prototype.DV = 1 << F;
var ee = 52;
h.prototype.FV = Math.pow(2, ee);
h.prototype.F1 = ee - F;
h.prototype.F2 = 2 * F - ee;
var gt = "0123456789abcdefghijklmnopqrstuvwxyz", G = [], K, U;
K = 48;
for (U = 0; U <= 9; ++U)
  G[K++] = U;
K = 97;
for (U = 10; U < 36; ++U)
  G[K++] = U;
K = 65;
for (U = 10; U < 36; ++U)
  G[K++] = U;
function le(t) {
  return gt.charAt(t);
}
function ft(t, e) {
  var n = G[t.charCodeAt(e)];
  return n ?? -1;
}
function pt(t) {
  for (var e = this.t - 1; e >= 0; --e)
    t[e] = this[e];
  t.t = this.t, t.s = this.s;
}
function Et(t) {
  this.t = 1, this.s = t < 0 ? -1 : 0, t > 0 ? this[0] = t : t < -1 ? this[0] = t + this.DV : this.t = 0;
}
function te(t) {
  var e = P();
  return e.fromInt(t), e;
}
function St(t, e) {
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
    var r = ft(t, s);
    if (r < 0) {
      t.charAt(s) == "-" && (o = !0);
      continue;
    }
    o = !1, i == 0 ? this[this.t++] = r : i + n > this.DB ? (this[this.t - 1] |= (r & (1 << this.DB - i) - 1) << i, this[this.t++] = r >> this.DB - i) : this[this.t - 1] |= r << i, i += n, i >= this.DB && (i -= this.DB);
  }
  this.clamp(), o && h.ZERO.subTo(this, this);
}
function Ct() {
  for (var t = this.s & this.DM; this.t > 0 && this[this.t - 1] == t; )
    --this.t;
}
function wt(t) {
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
    for (a < this.DB && (s = this[r] >> a) > 0 && (o = !0, i = le(s)); r >= 0; )
      a < e ? (s = (this[r] & (1 << a) - 1) << e - a, s |= this[--r] >> (a += this.DB - e)) : (s = this[r] >> (a -= e) & n, a <= 0 && (a += this.DB, --r)), s > 0 && (o = !0), o && (i += le(s));
  return o ? i : "0";
}
function Tt() {
  var t = P();
  return h.ZERO.subTo(this, t), t;
}
function At() {
  return this.s < 0 ? this.negate() : this;
}
function yt(t) {
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
function ne(t) {
  var e = 1, n;
  return (n = t >>> 16) != 0 && (t = n, e += 16), (n = t >> 8) != 0 && (t = n, e += 8), (n = t >> 4) != 0 && (t = n, e += 4), (n = t >> 2) != 0 && (t = n, e += 2), (n = t >> 1) != 0 && (t = n, e += 1), e;
}
function vt() {
  return this.t <= 0 ? 0 : this.DB * (this.t - 1) + ne(this[this.t - 1] ^ this.s & this.DM);
}
function It(t, e) {
  var n;
  for (n = this.t - 1; n >= 0; --n)
    e[n + t] = this[n];
  for (n = t - 1; n >= 0; --n)
    e[n] = 0;
  e.t = this.t + t, e.s = this.s;
}
function Pt(t, e) {
  for (var n = t; n < this.t; ++n)
    e[n - t] = this[n];
  e.t = Math.max(this.t - t, 0), e.s = this.s;
}
function Dt(t, e) {
  var n = t % this.DB, s = this.DB - n, o = (1 << s) - 1, i = Math.floor(t / this.DB), r = this.s << n & this.DM, a;
  for (a = this.t - 1; a >= 0; --a)
    e[a + i + 1] = this[a] >> s | r, r = (this[a] & o) << n;
  for (a = i - 1; a >= 0; --a)
    e[a] = 0;
  e[i] = r, e.t = this.t + i + 1, e.s = this.s, e.clamp();
}
function Ut(t, e) {
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
function Nt(t, e) {
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
function xt(t, e) {
  var n = this.abs(), s = t.abs(), o = n.t;
  for (e.t = o + s.t; --o >= 0; )
    e[o] = 0;
  for (o = 0; o < s.t; ++o)
    e[o + n.t] = n.am(0, s[o], e, o, 0, n.t);
  e.s = 0, e.clamp(), this.s != t.s && h.ZERO.subTo(e, e);
}
function Rt(t) {
  for (var e = this.abs(), n = t.t = 2 * e.t; --n >= 0; )
    t[n] = 0;
  for (n = 0; n < e.t - 1; ++n) {
    var s = e.am(n, e[n], t, 2 * n, 0, 1);
    (t[n + e.t] += e.am(n + 1, 2 * e[n], t, 2 * n + 1, s, e.t - n - 1)) >= e.DV && (t[n + e.t] -= e.DV, t[n + e.t + 1] = 1);
  }
  t.t > 0 && (t[t.t - 1] += e.am(n, e[n], t, 2 * n, 0, 1)), t.s = 0, t.clamp();
}
function kt(t, e, n) {
  var s = t.abs();
  if (!(s.t <= 0)) {
    var o = this.abs();
    if (o.t < s.t) {
      e != null && e.fromInt(0), n != null && this.copyTo(n);
      return;
    }
    n == null && (n = P());
    var i = P(), r = this.s, a = t.s, c = this.DB - ne(s[s.t - 1]);
    c > 0 ? (s.lShiftTo(c, i), o.lShiftTo(c, n)) : (s.copyTo(i), o.copyTo(n));
    var l = i.t, d = i[l - 1];
    if (d != 0) {
      var u = d * (1 << this.F1) + (l > 1 ? i[l - 2] >> this.F2 : 0), g = this.FV / u, S = (1 << this.F1) / u, I = 1 << this.F2, E = n.t, y = E - l, v = e ?? P();
      for (i.dlShiftTo(y, v), n.compareTo(v) >= 0 && (n[n.t++] = 1, n.subTo(v, n)), h.ONE.dlShiftTo(l, v), v.subTo(i, i); i.t < l; )
        i[i.t++] = 0;
      for (; --y >= 0; ) {
        var R = n[--E] == d ? this.DM : Math.floor(n[E] * g + (n[E - 1] + I) * S);
        if ((n[E] += i.am(0, R, n, y, 0, l)) < R)
          for (i.dlShiftTo(y, v), n.subTo(v, n); n[E] < --R; )
            n.subTo(v, n);
      }
      e != null && (n.drShiftTo(l, e), r != a && h.ZERO.subTo(e, e)), n.t = l, n.clamp(), c > 0 && n.rShiftTo(c, n), r < 0 && h.ZERO.subTo(n, n);
    }
  }
}
function Ft(t) {
  var e = P();
  return this.abs().divRemTo(t, null, e), this.s < 0 && e.compareTo(h.ZERO) > 0 && t.subTo(e, e), e;
}
function Mt() {
  if (this.t < 1)
    return 0;
  var t = this[0];
  if (!(t & 1))
    return 0;
  var e = t & 3;
  return e = e * (2 - (t & 15) * e) & 15, e = e * (2 - (t & 255) * e) & 255, e = e * (2 - ((t & 65535) * e & 65535)) & 65535, e = e * (2 - t * e % this.DV) % this.DV, e > 0 ? this.DV - e : -e;
}
function _t(t) {
  return this.compareTo(t) == 0;
}
function bt(t, e) {
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
function Bt(t) {
  var e = P();
  return this.addTo(t, e), e;
}
function Ot(t) {
  var e = P();
  return this.subTo(t, e), e;
}
function Vt(t) {
  var e = P();
  return this.multiplyTo(t, e), e;
}
function Kt(t) {
  var e = P();
  return this.divRemTo(t, e, null), e;
}
function $(t) {
  this.m = t, this.mp = t.invDigit(), this.mpl = this.mp & 32767, this.mph = this.mp >> 15, this.um = (1 << t.DB - 15) - 1, this.mt2 = 2 * t.t;
}
function $t(t) {
  var e = P();
  return t.abs().dlShiftTo(this.m.t, e), e.divRemTo(this.m, null, e), t.s < 0 && e.compareTo(h.ZERO) > 0 && this.m.subTo(e, e), e;
}
function Wt(t) {
  var e = P();
  return t.copyTo(e), this.reduce(e), e;
}
function Ht(t) {
  for (; t.t <= this.mt2; )
    t[t.t++] = 0;
  for (var e = 0; e < this.m.t; ++e) {
    var n = t[e] & 32767, s = n * this.mpl + ((n * this.mph + (t[e] >> 15) * this.mpl & this.um) << 15) & t.DM;
    for (n = e + this.m.t, t[n] += this.m.am(0, s, t, e, 0, this.m.t); t[n] >= t.DV; )
      t[n] -= t.DV, t[++n]++;
  }
  t.clamp(), t.drShiftTo(this.m.t, t), t.compareTo(this.m) >= 0 && t.subTo(this.m, t);
}
function Gt(t, e) {
  t.squareTo(e), this.reduce(e);
}
function Lt(t, e, n) {
  t.multiplyTo(e, n), this.reduce(n);
}
$.prototype.convert = $t;
$.prototype.revert = Wt;
$.prototype.reduce = Ht;
$.prototype.mulTo = Lt;
$.prototype.sqrTo = Gt;
function qt(t, e, n) {
  var s = t.bitLength(), o = te(1), i = new $(e), r;
  if (s <= 0)
    return o;
  s < 18 ? r = 1 : s < 48 ? r = 3 : s < 144 ? r = 4 : s < 768 ? r = 5 : r = 6;
  var a = [], c = r - 1, l = (1 << r) - 1, d = 3;
  if (a[1] = i.convert(this), r > 1) {
    var u = P();
    for (i.sqrTo(a[1], u); d <= l; )
      a[d] = P(), i.mulTo(u, a[d - 2], a[d]), d += 2;
  }
  var g = t.t - 1, S, I = !0, E = P(), y;
  for (s = ne(t[g]) - 1; g >= 0; ) {
    for (s >= c ? S = t[g] >> s - c & l : (S = (t[g] & (1 << s + 1) - 1) << c - s, g > 0 && (S |= t[g - 1] >> this.DB + s - c)), d = r; !(S & 1); )
      S >>= 1, --d;
    if ((s -= d) < 0 && (s += this.DB, --g), I)
      a[S].copyTo(o), I = !1;
    else {
      for (; d > 1; )
        i.sqrTo(o, E), i.sqrTo(E, o), d -= 2;
      d > 0 ? i.sqrTo(o, E) : (y = o, o = E, E = y), i.mulTo(E, a[S], o);
    }
    for (; g >= 0 && !(t[g] & 1 << s); )
      i.sqrTo(o, E), y = o, o = E, E = y, --s < 0 && (s = this.DB - 1, --g);
  }
  var v = i.revert(o);
  return n && n(null, v), v;
}
function Zt() {
  return this.compareTo(h.ZERO) == 0;
}
h.prototype.copyTo = pt;
h.prototype.fromInt = Et;
h.prototype.fromString = St;
h.prototype.clamp = Ct;
h.prototype.dlShiftTo = It;
h.prototype.drShiftTo = Pt;
h.prototype.lShiftTo = Dt;
h.prototype.rShiftTo = Ut;
h.prototype.subTo = Nt;
h.prototype.multiplyTo = xt;
h.prototype.squareTo = Rt;
h.prototype.divRemTo = kt;
h.prototype.invDigit = Mt;
h.prototype.addTo = bt;
h.prototype.toString = wt;
h.prototype.abs = At;
h.prototype.negate = Tt;
h.prototype.compareTo = yt;
h.prototype.bitLength = vt;
h.prototype.mod = Ft;
h.prototype.equals = _t;
h.prototype.add = Bt;
h.prototype.subtract = Ot;
h.prototype.multiply = Vt;
h.prototype.divide = Kt;
h.prototype.modPow = qt;
h.prototype.isZero = Zt;
h.ZERO = te(0);
h.ONE = te(1);
var N = function(t, e) {
  return new h(t, e);
};
const Jt = "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6BF12FFA06D98A0864D87602733EC86A64521F2B18177B200CBBE117577A615D6C770988C0BAD946E208E24FA074E5AB3143DB5BFCE0FD108E4B82D120A93AD2CAFFFFFFFFFFFFFFFF";
class se {
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
      if (this.smallAValue = N(
        C.codec.hex.fromBits(C.random.randomWords(8, 0)),
        16
      ).mod(this.N), !this.smallAValue) throw new Error("Failed to generate smallAValue");
      return this.smallAValue.toString(16);
    });
    /**
     *
     */
    f(this, "calculateA", (e = this.generateRandomSmallA()) => {
      if (this.largeAValue = this.g.modPow(N(e, 16), this.N), this.largeAValue.mod(this.N).isZero()) throw new Error("Illegal parameter. A mod N cannot be 0.");
      return this.largeAValue.toString(16);
    });
    /**
     *
     */
    f(this, "calculateU", (e, n) => N(
      Z(`${_(e)}${_(n)}`),
      16
    ));
    /**
     *
     */
    f(this, "getPasswordAuthenticationKey", (e, n, s, o) => {
      let i = N(s, 16), r = N(o, 16);
      if (i.mod(this.N).isZero()) throw new Error("B cannot be zero.");
      if (!this.largeAValue) throw new Error("largeAValue is undefined");
      if (this.UValue = this.calculateU(
        this.largeAValue,
        i
      ), this.UValue.isZero()) throw new Error("U cannot be zero.");
      const l = `${this.poolName}${e}:${n}`, d = j(l), u = `${_(r)}${d}`, g = N(Z(u), 16), S = this.g.modPow(g, this.N), I = i.subtract(
        this.k.multiply(S)
      );
      if (!this.smallAValue) throw new Error("smallAValue is undefined");
      const E = this.UValue.multiply(g), y = I.modPow(
        this.smallAValue.add(E),
        this.N
      ).mod(this.N);
      return rt(
        _(y),
        _(this.UValue)
      );
    });
    /**
     *
     */
    f(this, "generateHashDevice", (e, n) => {
      this.randomPassword = at();
      const s = `${e}${n}:${this.randomPassword}`, o = j(s), i = we(16), r = ct(i);
      return this.saltToHashDevices = _(
        N(r, 16)
      ), new Promise((a, c) => {
        (async () => {
          try {
            const l = lt(this.saltToHashDevices + o), d = N(l, 16), u = this.g.modPow(d, this.N);
            this.verifierDevices = _(u);
          } catch (l) {
            c(l);
          }
        })();
      });
    });
    this.poolName = e, this.N = N(Jt, 16), this.g = N("2", 16), this.k = N(
      Z(`00${this.N.toString(16)}0${this.g.toString(16)}`),
      16
    ), this.saltToHashDevices = "", this.verifierDevices = "", this.randomPassword = "";
  }
}
const de = () => {
  throw new p({
    name: "InvalidUserPoolIdException",
    message: m.InvalidUserPoolIdException
  });
}, Te = (t) => {
  (typeof t != "string" || !t.includes("_")) && de();
  const e = t.split("_").map((n) => n.trim());
  return (e.length !== 2 || e[0] === "" || e[1] === "") && de(), e;
}, T = (t) => {
  const [e] = Te(t);
  return e;
}, oe = (t) => {
  const [, e] = Te(t);
  return e;
}, Ae = async (t, e, n) => {
  if (!e) return;
  const s = oe(t), o = (e == null ? void 0 : e.DeviceKey) ?? "", i = (e == null ? void 0 : e.DeviceGroupKey) ?? "", r = T(t), a = new w({ region: r }), c = new se(s);
  try {
    c.generateHashDevice(i, o);
  } catch {
    return;
  }
  const l = {
    Salt: re(c.saltToHashDevices),
    PasswordVerifier: re(c.verifierDevices)
  };
  try {
    const d = c.randomPassword, u = new Me({
      AccessToken: n,
      DeviceKey: o,
      DeviceSecretVerifierConfig: l
    });
    return await a.send(u), {
      deviceKey: o,
      deviceGroupKey: i,
      randomPassword: d
    };
  } catch {
    return;
  }
}, L = (t) => {
  const e = V(), n = H(t), s = e.getItem(n.deviceKey), o = e.getItem(n.deviceGroupKey), i = e.getItem(n.randomPassword);
  return i ? {
    deviceKey: s,
    deviceGroupKey: o,
    randomPassword: i
  } : void 0;
}, ie = () => {
  const t = V();
  try {
    const e = H(), n = t.getItem(e.accessToken);
    if (!n)
      throw new p({
        name: "NoSessionFoundException",
        message: m.NoSessionFoundException
      });
    const s = B(n), o = t.getItem(e.idToken), i = o ? B(o) : void 0, r = t.getItem(e.refreshToken) ?? void 0, a = t.getItem(e.clockDrift) ?? "0", c = Number.parseInt(a), l = t.getItem(e.signInDetails), d = {
      accessToken: s,
      idToken: i,
      refreshToken: r,
      deviceMetadata: L() ?? void 0,
      clockDrift: c,
      username: Q(),
      signInDetails: void 0
    };
    return l && (d.signInDetails = JSON.parse(l)), d;
  } catch {
    return null;
  }
}, jt = (t) => {
  if ((t.message !== "Network error" || t.message !== "The Internet connection appears to be offline.") && X(), z.dispatch("auth", {
    event: "tokenRefreshFailure",
    data: { err: t }
  }), t.name.startsWith("NotAuthorizedException"))
    return null;
  throw t;
}, zt = async ({
  tokens: t,
  username: e
}) => {
  var n;
  try {
    const s = t.refreshToken;
    if (!s)
      throw new p({
        name: "MissingRefreshTokenException",
        message: m.MissingRefreshTokenException
      });
    const o = t.deviceMetadata;
    if (!o)
      throw new p({
        name: "MissingDeviceMetadataException",
        message: m.MissingDeviceMetadataException
      });
    const i = (n = A.getConfig().Auth) == null ? void 0 : n.Cognito, { userPoolId: r, userPoolClientId: a } = i, c = T(r), l = new w({ region: c }), d = new me({
      ClientId: a,
      AuthFlow: "REFRESH_TOKEN_AUTH",
      AuthParameters: {
        REFRESH_TOKEN: s,
        DEVICE_KEY: o.deviceKey
      }
    }), {
      AuthenticationResult: u
    } = await l.send(d), g = B((u == null ? void 0 : u.AccessToken) ?? ""), S = u != null && u.IdToken ? B(u.IdToken) : void 0, I = g.payload.iat;
    if (!I)
      throw new p({
        name: "iatNotFoundException",
        message: m.iatNotFoundException
      });
    const E = I * 1e3 - (/* @__PURE__ */ new Date()).getTime();
    return {
      accessToken: g,
      idToken: S,
      clockDrift: E,
      refreshToken: t.refreshToken,
      username: e
    };
  } catch (s) {
    return jt(s);
  }
}, he = (t, e) => Date.now() + e > t, k = async (t) => {
  var r, a, c, l;
  let e = ie();
  const n = Q();
  if (e === null)
    return null;
  const s = e != null && e.idToken ? he(
    (((a = (r = e.idToken) == null ? void 0 : r.payload) == null ? void 0 : a.exp) ?? 0) * 1e3,
    e.clockDrift ?? 0
  ) : !0, o = e != null && e.accessToken ? he(
    (((l = (c = e.accessToken) == null ? void 0 : c.payload) == null ? void 0 : l.exp) ?? 0) * 1e3,
    e.clockDrift ?? 0
  ) : !0;
  return ((t == null ? void 0 : t.forceRefresh) || s || o) && (e = await zt({
    tokens: e,
    username: n
  }), e === null) ? null : {
    accessToken: e == null ? void 0 : e.accessToken,
    idToken: e == null ? void 0 : e.idToken,
    signInDetails: e == null ? void 0 : e.signInDetails
  };
}, Yt = async () => {
  var i;
  const t = await k({ forceRefresh: !1 });
  x(t);
  const {
    "cognito:username": e,
    sub: n
  } = ((i = t.idToken) == null ? void 0 : i.payload) ?? {}, s = {
    username: e,
    userId: n
  }, o = t.signInDetails;
  return o && (s.signInDetails = o), s;
}, J = (t) => typeof t == "string" && t.trim().length > 0, m = {
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
  EmptyResetPasswordUsernameException: "Username cannot be empty to reset password.",
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
}, Qt = async () => {
  let t = null;
  try {
    t = await Yt();
  } catch {
  }
  if (t && t.userId && t.username)
    throw new p({
      name: "UserAlreadyAuthenticatedException",
      message: m.UserAlreadyAuthenticatedException
    });
};
function Xt(t) {
  if (!((t != null && t.accessToken || t != null && t.idToken) && (t != null && t.refreshToken)))
    throw new p({
      name: "UserUnauthenticatedException",
      message: m.UserUnauthenticatedException
    });
}
function ye(t) {
  if (!(!!t && J(t.deviceKey) && J(t.deviceGroupKey) && J(t.randomPassword)))
    throw new p({
      name: "DeviceMetadataException",
      message: m.DeviceMetadataException
    });
}
function x(t) {
  const e = t == null ? void 0 : t.accessToken;
  if (!(e && e.payload && e.toString()))
    throw new p({
      name: "UserUnauthenticatedException",
      message: m.UserUnauthenticatedException
    });
}
class bn {
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
          message: m.InvalidSameSiteValueException
        });
      if (r === "none" && !this.secure)
        throw new p({
          name: "SameSiteNoneRequiresSequreException",
          message: m.SameSiteNoneRequiresSequreException
        });
      this.sameSite = r;
    }
  }
  getItem(e) {
    return W.get(e) ?? null;
  }
  setItem(e, n) {
    W.set(e, n, this.getData());
  }
  removeItem(e) {
    W.remove(e, this.getData());
  }
  clear() {
    const e = W.get();
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
class en {
  constructor() {
    f(this, "resourcesConfig", {});
    f(this, "keyValueStorage", new je());
    f(this, "getConfig", () => {
      if (Object.keys(this.resourcesConfig).length === 0)
        throw new p({
          name: "InvalidConfigException",
          message: m.InvalidConfigException
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
        message: m.InvalidConfigException
      });
  }
  setKeyValueStorage(e) {
    this.keyValueStorage = e;
  }
}
const A = new en(), tn = async (t) => {
  const e = await k(t);
  x(e);
  const n = e.accessToken.payload.sub;
  return { tokens: e, sub: n };
}, ve = () => ({
  username: "",
  challengeName: void 0,
  signInSession: void 0,
  signInDetails: void 0
}), nn = (t, e) => {
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
      return ve();
    default:
      return t;
  }
}, sn = (t) => {
  const e = ve();
  let n = t(e, { type: "SET_INITIAL_STATE" });
  return {
    getState: () => n,
    dispatch: (s) => {
      n = t(n, s);
    }
  };
}, Ie = (t) => {
  M.dispatch({
    type: "SET_SIGN_IN_STATE",
    value: t
  });
}, Pe = () => {
  M.dispatch({
    type: "SET_INITIAL_STATE"
  });
}, M = sn(nn), on = (t) => {
  const { dispatch: e } = M;
  e({ type: "SET_USERNAME", value: t });
}, rn = (t) => M.getState().username ?? t, an = (t) => {
  if (t === "PasswordResetRequiredException")
    return {
      isSignedIn: !1,
      nextStep: { signInStep: "RESET_PASSWORD" }
    };
}, De = (t) => {
  if (t === "SMS_MFA") return "SMS";
  if (t === "SOFTWARE_TOKEN_MFA") return "TOTP";
}, Ue = (t) => {
  if (t)
    return t.map(De).filter(Boolean);
}, cn = (t) => t ? JSON.parse(t) : [], ln = (t, e) => {
  const { MFAS_CAN_SETUP: n } = t, s = cn(n), o = Ue(s);
  return o == null ? void 0 : o.includes(e);
}, dn = (t, e) => ({
  sharedSecret: t,
  getSetupUri: (n, s) => `otpauth://totp/${n}:${s ?? e}?secret=${t}&issuer=${n}`
}), hn = async ({
  username: t,
  client: e,
  srp: n,
  challengeParameters: s,
  session: o,
  cognitoConfig: i
}) => {
  const { userPoolClientId: r } = i, a = L(t);
  ye(a);
  const {
    deviceKey: c,
    deviceGroupKey: l,
    randomPassword: d
  } = a, {
    SRP_B: u,
    SALT: g,
    SECRET_BLOCK: S
  } = s, I = Se(), E = n.getPasswordAuthenticationKey(c, d, u, g), y = Ce(E, l, c, S, I), v = {
    USERNAME: (s == null ? void 0 : s.USERNAME) ?? t,
    PASSWORD_CLAIM_SECRET_BLOCK: S,
    TIMESTAMP: I,
    PASSWORD_CLAIM_SIGNATURE: y,
    DEVICE_KEY: c
  }, R = new O({
    ChallengeName: "DEVICE_PASSWORD_VERIFIER",
    ChallengeResponses: v,
    ClientId: r,
    Session: o
  });
  return await e.send(R);
}, un = async (t, e) => {
  const n = L(t);
  ye(n);
  const { userPoolId: s, userPoolClientId: o } = e, i = T(s), r = new w({ region: i }), a = new se(n.deviceGroupKey), c = a.calculateA(), l = new O({
    ChallengeName: "DEVICE_SRP_AUTH",
    ChallengeResponses: {
      USERNAME: t,
      SRP_A: c,
      DEVICE_KEY: n.deviceKey
    },
    ClientId: o
  }), {
    ChallengeParameters: d,
    Session: u
  } = await r.send(l);
  if (!d)
    throw new p({
      name: "MissingChallengeParametersException",
      message: m.MissingChallengeParametersException
    });
  return await hn({
    username: t,
    client: r,
    srp: a,
    challengeParameters: d,
    session: u,
    cognitoConfig: e
  });
}, mn = async ({
  username: t,
  password: e,
  cognitoConfig: n
}) => {
  const { userPoolId: s, userPoolClientId: o } = n, i = oe(s), r = T(s), a = new w({ region: r }), c = new se(i), l = c.calculateA(), d = new me({
    AuthFlow: "USER_SRP_AUTH",
    AuthParameters: {
      USERNAME: t,
      SRP_A: l
    },
    ClientId: o
  }), {
    ChallengeName: u,
    ChallengeParameters: g,
    Session: S
  } = await a.send(d);
  if (!(g && g.SRP_B && g.SALT && g.SECRET_BLOCK))
    throw new p({
      name: "MissingChallengeParametersException",
      message: m.MissingChallengeParametersException
    });
  const E = g.USERNAME ?? t;
  if (on(E), !u)
    throw new p({
      name: "MissingChallengeNameException",
      message: m.MissingChallengeNameException
    });
  const y = await gn({
    challengeName: u,
    cognitoConfig: n,
    client: a,
    srp: c,
    password: e,
    challengeParameters: g,
    session: S
  });
  return y.ChallengeName === "DEVICE_SRP_AUTH" ? un(E, n) : y;
}, gn = async ({
  challengeName: t,
  cognitoConfig: e,
  client: n,
  srp: s,
  password: o,
  challengeParameters: i,
  session: r
}) => {
  const { userPoolId: a, userPoolClientId: c } = e, l = oe(a), {
    SRP_B: d,
    SALT: u,
    SECRET_BLOCK: g
  } = i, S = i.USER_ID_FOR_SRP;
  if (!S)
    throw new p({
      name: "EmptyUserIdForSRPException",
      message: m.EmptyUserIdForSRPException
    });
  const I = Se(), E = s.getPasswordAuthenticationKey(S, o, d, u), y = Ce(E, l, S, g, I), v = {
    USERNAME: S,
    PASSWORD_CLAIM_SECRET_BLOCK: g,
    TIMESTAMP: I,
    PASSWORD_CLAIM_SIGNATURE: y
  }, R = L(S);
  R && R.deviceKey && (v.DEVICE_KEY = R.deviceKey);
  const Re = new O({
    ChallengeName: t,
    ChallengeResponses: v,
    ClientId: c,
    Session: r
  });
  return await n.send(Re);
}, fn = (t) => {
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
}, pn = (t) => ({
  isSignedIn: !1,
  nextStep: {
    signInStep: "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED",
    missingAttributes: fn(t.requiredAttributes)
  }
}), En = async (t) => {
  var u;
  const { signInSession: e, username: n } = M.getState(), s = (u = A.getConfig().Auth) == null ? void 0 : u.Cognito, { userPoolId: o } = s, i = T(o);
  if (!ln(t, "TOTP"))
    throw new p({
      name: "SignInException",
      message: m.InvalidMFASetupTypeException + ": TOTP"
    });
  const a = new w({ region: i }), c = new _e({
    Session: e
  }), {
    SecretCode: l,
    Session: d
  } = await a.send(c);
  if (!l)
    throw new p({
      name: "MissingSecretCodeException",
      message: m.MissingSecretCodeException
    });
  return M.dispatch({
    type: "SET_SIGN_IN_SESSION",
    value: d
  }), {
    isSignedIn: !1,
    nextStep: {
      signInStep: "CONTINUE_SIGN_IN_WITH_TOTP_SETUP",
      totpSetupDetails: dn(l, n)
    }
  };
}, Sn = () => ({
  isSignedIn: !1,
  nextStep: {
    signInStep: "CONFIRM_SIGN_IN_WITH_TOTP_CODE"
  }
}), Cn = {
  NEW_PASSWORD_REQUIRED: pn,
  MFA_SETUP: En,
  SOFTWARE_TOKEN_MFA: Sn
}, Ne = (t, e) => {
  const n = Cn[t ?? ""];
  if (n) return n(e);
  throw new p({
    name: "ChallengeNotHandledException",
    message: `No next step for challenge: ${t}`
  });
}, wn = async (t) => {
  const { username: e, password: n } = t, s = {
    loginId: e,
    authFlowType: "USER_SRP_AUTH"
  };
  D(!!e, "EmptyUsernameException", m.EmptyUsernameException), D(!!n, "EmptyPasswordException", m.EmptyPasswordException);
  try {
    const o = A.getConfig().Auth.Cognito, {
      ChallengeName: i,
      ChallengeParameters: r,
      AuthenticationResult: a,
      Session: c
    } = await mn({
      username: e,
      password: n,
      cognitoConfig: o
    }), l = rn(e);
    if (Ie({
      signInSession: c,
      username: l,
      challengeName: i,
      signInDetails: s
    }), a)
      return Pe(), Ee({
        username: l,
        authenticationResult: a,
        newDeviceMetadata: await Ae(
          o.userPoolId,
          a.NewDeviceMetadata,
          a.AccessToken
        ),
        signInDetails: s
      }), z.dispatch("auth", {
        event: "signedIn",
        data: await tn()
      }), {
        isSignedIn: !0,
        nextStep: { signInStep: "DONE" }
      };
    if (!i)
      throw new p({
        name: "MissingChallengeNameException",
        message: m.MissingChallengeNameException
      });
    return Ne(
      i,
      r
    );
  } catch (o) {
    const i = an(o.name);
    if (i) return i;
    throw o;
  }
}, Bn = async (t) => {
  var n;
  const e = (n = t.options) == null ? void 0 : n.authFlowType;
  switch (await Qt(), e) {
    default:
      return wn(t);
  }
}, On = async (t) => {
  var s;
  const e = (s = A.getConfig().Auth) == null ? void 0 : s.Cognito;
  (t == null ? void 0 : t.isGlobal) ? await An(e) : await Tn(e), X(), z.dispatch("auth", {
    event: "signedOut"
  });
}, Tn = async (t) => {
  try {
    const e = ie();
    if (Xt(e), !xe(e.accessToken)) return;
    const { userPoolId: s, userPoolClientId: o } = t, i = T(s), r = new w({ region: i }), a = new be({
      ClientId: o,
      Token: e.refreshToken
    });
    await r.send(a);
  } catch {
    console.log(m.ClientSignOutErrorException);
  }
}, An = async (t) => {
  try {
    const e = ie();
    if (x(e), !xe(e.accessToken)) return;
    const { userPoolId: s } = t, o = T(s), i = new w({ region: o }), r = new Be({
      AccessToken: e.accessToken.toString()
    });
    await i.send(r);
  } catch {
    console.log(m.GlobalSignOutErrorException);
  }
}, xe = (t) => {
  var e;
  return !!((e = t == null ? void 0 : t.payload) != null && e.origin_jti);
}, yn = (t) => {
  const e = "userAttributes.";
  return t ? Object.entries(t).reduce((n, [s, o]) => (o && (n[`${e}${s}`] = o), n), {}) : {};
}, vn = async ({
  username: t,
  signInSession: e,
  challengeResponse: n,
  cognitoConfig: s,
  options: o
}) => {
  const { userPoolId: i, userPoolClientId: r } = s, a = T(i), c = new w({ region: a }), l = new O({
    ChallengeName: "NEW_PASSWORD_REQUIRED",
    ChallengeResponses: {
      ...yn(o == null ? void 0 : o.requiredAttributes),
      NEW_PASSWORD: n,
      USERNAME: t
    },
    ClientId: r,
    Session: e
  });
  return await c.send(l);
}, In = async ({
  username: t,
  signInSession: e,
  challengeResponse: n,
  cognitoConfig: s
}) => {
  const { userPoolId: o, userPoolClientId: i } = s, r = T(o), a = new w({ region: r }), c = new ge({
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
}, Pn = async ({
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
}, Dn = {
  NEW_PASSWORD_REQUIRED: vn,
  MFA_SETUP: In,
  SOFTWARE_TOKEN_MFA: Pn
}, Un = async ({
  username: t,
  challengeName: e,
  signInSession: n,
  challengeResponse: s,
  cognitoConfig: o,
  options: i
}) => {
  const r = Dn[e];
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
}, Vn = async (t) => {
  const { challengeResponse: e, options: n } = t, { username: s, challengeName: o, signInSession: i, signInDetails: r } = M.getState();
  if (D(
    !!e && typeof e == "string",
    "InvalidChallengeResponseException",
    m.InvalidChallengeResponseException
  ), D(
    !!s && !!i,
    "SignInException",
    m.SignInException
  ), !o)
    throw new p({
      name: "MissingChallengeNameException",
      message: m.MissingChallengeNameException
    });
  const a = A.getConfig().Auth.Cognito, {
    ChallengeName: c,
    ChallengeParameters: l,
    AuthenticationResult: d,
    Session: u
  } = await Un({
    username: s,
    challengeName: o,
    signInSession: i,
    challengeResponse: e,
    cognitoConfig: a,
    options: n
  });
  return Ie({
    username: s,
    challengeName: c,
    signInSession: u,
    signInDetails: r
  }), d ? (Pe(), Ee({
    username: s,
    authenticationResult: d,
    newDeviceMetadata: await Ae(
      a.userPoolId,
      d.NewDeviceMetadata,
      d.AccessToken
    ),
    signInDetails: r
  }), {
    isSignedIn: !0,
    nextStep: { signInStep: "DONE" }
  }) : Ne(
    c,
    l
  );
}, Kn = async (t) => {
  var d;
  const e = (d = A.getConfig().Auth) == null ? void 0 : d.Cognito, { userPoolId: n, userPoolClientId: s } = e, { username: o, newPassword: i, confirmationCode: r } = t;
  D(
    !!o,
    "EmptyConfirmResetPasswordUsernameException",
    m.EmptyConfirmResetPasswordUsernameException
  ), D(
    !!i,
    "EmptyConfirmResetPasswordNewPasswordException",
    m.EmptyConfirmResetPasswordNewPasswordException
  ), D(
    !!r,
    "EmptyConfirmResetPasswordConfirmationCodeException",
    m.EmptyConfirmResetPasswordConfirmationCodeException
  );
  const a = T(n), c = new w({ region: a }), l = new Oe({
    Username: o,
    ConfirmationCode: r,
    Password: i,
    ClientId: s
  });
  await c.send(l);
}, $n = async (t) => {
  var d;
  const e = (d = A.getConfig().Auth) == null ? void 0 : d.Cognito, { userPoolId: n, userPoolClientId: s } = e, o = t.username;
  D(
    !!o,
    "EmptyResetPasswordUsernameException",
    m.EmptyResetPasswordUsernameException
  );
  const i = T(n), r = new w({ region: i }), a = new Ve({
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
}, Wn = async (t) => {
  const { previousPassword: e, proposedPassword: n } = t, s = await k();
  x(s), D(
    !!e && !!n,
    "EmptyChangePasswordException",
    m.EmptyChangePasswordException
  );
  const o = A.getConfig().Auth.Cognito, { userPoolId: i } = o, r = T(i), a = new w({ region: r }), c = new Ke({
    PreviousPassword: e,
    ProposedPassword: n,
    AccessToken: s.accessToken.toString()
  });
  await a.send(c);
}, Hn = async () => {
  const t = await k();
  x(t);
  const e = A.getConfig().Auth.Cognito, { userPoolId: n } = e, s = T(n), o = new w({ region: s }), i = new fe({
    AccessToken: t.accessToken.toString()
  }), {
    PreferredMfaSetting: r,
    UserMFASettingList: a
  } = await o.send(i);
  return {
    preferredMFASetting: De(r),
    userMFASettingList: Ue(a)
  };
}, ue = (t) => {
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
}, Gn = async (t) => {
  const { sms: e, totp: n } = t, s = await k();
  x(s);
  const o = A.getConfig().Auth.Cognito, { userPoolId: i } = o, r = T(i), a = new w({ region: r }), c = new $e({
    AccessToken: s.accessToken.toString(),
    SoftwareTokenMfaSettings: ue(n),
    SMSMfaSettings: ue(e)
  });
  await a.send(c);
}, Nn = 60, Ln = async () => {
  const t = await k();
  x(t);
  const e = A.getConfig().Auth.Cognito, { userPoolId: n } = e, s = T(n), o = new w({ region: s }), i = new We({
    AccessToken: t.accessToken.toString(),
    Limit: Nn
  });
  return await o.send(i);
}, xn = (t) => {
  const e = {};
  return t == null || t.map(({ Name: n, Value: s }) => {
    n && (e[n] = s);
  }), e;
}, qn = async () => {
  const t = await k();
  x(t);
  const e = A.getConfig().Auth.Cognito, { userPoolId: n } = e, s = T(n), o = new w({ region: s }), i = new fe({
    AccessToken: t.accessToken.toString()
  }), {
    UserAttributes: r
  } = await o.send(i);
  return xn(r);
}, Zn = async (t) => {
  const { code: e, options: n } = t, s = await k();
  x(s), D(
    !!e,
    "EmptyVerifyTOTPCodeException",
    m.EmptyVerifyTOTPCodeException
  );
  const o = A.getConfig().Auth.Cognito, { userPoolId: i } = o, r = T(i), a = new w({ region: r }), c = new ge({
    AccessToken: s.accessToken.toString(),
    UserCode: e,
    FriendlyDeviceName: n == null ? void 0 : n.deviceName
  }), l = await a.send(c);
  return {
    status: l.Status,
    session: l.Session
  };
}, Rn = (t) => Object.entries(t).map(([e, n]) => ({
  Name: e,
  Value: n
})), Jn = async (t) => {
  const { username: e, password: n, options: s } = t;
  D(
    !!e,
    "EmptySignUpUsernameException",
    m.EmptySignUpUsernameException
  ), D(
    !!n,
    "EmptySignUpPasswordException",
    m.EmptySignUpPasswordException
  );
  const o = A.getConfig().Auth.Cognito, { userPoolId: i, userPoolClientId: r } = o, a = T(i), c = new w({ region: a }), l = new He({
    ClientId: r,
    Username: e,
    Password: n,
    UserAttributes: (s == null ? void 0 : s.userAttributes) && Rn(s == null ? void 0 : s.userAttributes)
  }), {
    UserConfirmed: d,
    CodeDeliveryDetails: u,
    UserSub: g
  } = await c.send(l);
  return d ? {
    isSignUpComplete: !0,
    nextStep: {
      signUpStep: "DONE"
    },
    userId: g
  } : {
    isSignUpComplete: !1,
    nextStep: {
      signUpStep: "CONFIRM_SIGN_UP",
      codeDeliveryDetails: {
        deliveryMedium: u == null ? void 0 : u.DeliveryMedium,
        destination: u == null ? void 0 : u.Destination,
        attributeName: u == null ? void 0 : u.AttributeName
      }
    },
    userId: g
  };
}, jn = async (t) => {
  const { username: e, confirmationCode: n, options: s } = t;
  D(
    !!e,
    "EmptyConfirmSignUpUsernameException",
    m.EmptyConfirmSignUpUsernameException
  ), D(
    !!n,
    "EmptyConfirmSignUpCodeException",
    m.EmptyConfirmSignUpCodeException
  );
  const o = A.getConfig().Auth.Cognito, { userPoolId: i, userPoolClientId: r } = o, a = T(i), c = new w({ region: a }), l = new Ge({
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
}, zn = async (t) => {
  const { username: e } = t;
  D(
    !!e,
    "EmptyResendSignUpCodeUsernameException",
    m.EmptyResendSignUpCodeUsernameException
  );
  const n = A.getConfig().Auth.Cognito, { userPoolId: s, userPoolClientId: o } = n, i = T(s), r = new w({ region: i }), a = new Le({
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
}, Yn = async () => {
  const t = await k();
  x(t);
  const e = A.getConfig().Auth.Cognito, { userPoolId: n } = e, s = T(n), o = new w({ region: s }), i = new qe({
    AccessToken: t.accessToken.toString()
  });
  await o.send(i);
};
export {
  bn as CookieStorage,
  je as DefaultStorage,
  A as EasyAuth,
  Ze as InMemoryStorage,
  Kn as confirmResetPassword,
  Vn as confirmSignIn,
  jn as confirmSignUp,
  Yn as deleteUser,
  tn as getCurrentSession,
  Yt as getCurrentUser,
  Ln as getDevices,
  Hn as getMFAPreference,
  qn as getUserAttributes,
  zn as resendSignUpCode,
  $n as resetPassword,
  Bn as signIn,
  On as signOut,
  Jn as signUp,
  Gn as updateMFAPreference,
  Wn as updatePassword,
  Zn as verifyTOTP
};
