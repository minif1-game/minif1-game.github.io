/* Firebase bridge: gives the game the same online API it uses inside Claude (db, user, room). */
(function () {
  const cfg = {
    apiKey: 'AIzaSyCR_ndCZGK-G3L2EdZSomHHsaD320-n2pA',
    authDomain: 'minif1-game.firebaseapp.com',
    databaseURL: 'https://minif1-game-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'minif1-game',
    storageBucket: 'minif1-game.firebasestorage.app',
    messagingSenderId: '317731385607',
    appId: '1:317731385607:web:75e0f3692bd1ff655415a2'
  };
  if (!window.firebase) return;
  firebase.initializeApp(cfg);
  const auth = firebase.auth(), rdb = firebase.database();
  let off = 0; rdb.ref('.info/serverTimeOffset').on('value', s => { off = s.val() || 0; });
  const now = () => Date.now() + off;
  const ready = new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('timeout')), 12000);
    auth.onAuthStateChanged(u => { if (u) { clearTimeout(t); res(u); } });
    auth.signInAnonymously().catch(e => { clearTimeout(t); rej(e); });
  });
  const clean = v => JSON.parse(JSON.stringify(v, (k, x) => x === undefined ? null : x));
  const snapOf = s => ({ exists: s.exists(), id: s.key, data: () => s.val() });
  const db = {
    doc(path) {
      const ref = rdb.ref(path);
      return {
        get: () => ref.once('value').then(snapOf),
        set: body => ref.set(clean(body)),
        acquire: () => Promise.resolve({ acquired: true })
      };
    },
    collection(path) {
      return {
        onSnapshot(cb, err) {
          const h = s => { const docs = []; s.forEach(c => { docs.push(snapOf(c)); }); cb({ docs }); };
          rdb.ref(path).on('value', h, e => err && err(e));
          return () => rdb.ref(path).off('value', h);
        }
      };
    }
  };
  function makeRoom(uid) {
    const base = rdb.ref('rooms/main'), me = base.child(uid);
    let last = {}, cbs = [];
    me.onDisconnect().remove();
    const push = () => me.set({ p: clean(last), t: firebase.database.ServerValue.TIMESTAMP });
    setInterval(() => { if (Object.keys(last).length) push().catch(() => {}); }, 15000);
    let peers = [];
    base.on('value', s => {
      const lim = now() - 45000; peers = [];
      s.forEach(c => { const v = c.val() || {}; if ((v.t || 0) > lim) peers.push({ peer: c.key, sameTab: c.key === uid, presence: v.p || {} }); });
      cbs.forEach(f => { try { f({ peers }); } catch (e) {} });
    }, () => {});
    return {
      presence(p) { Object.assign(last, p); return push(); },
      onPeers(cb) { cbs.push(cb); cb({ peers }); }
    };
  }
  // second app instance only for e-mail link confirmation (keeps the anonymous game session untouched)
  const vAuth = firebase.initializeApp(cfg, 'verify').auth();
  try { vAuth.setPersistence(firebase.auth.Auth.Persistence.NONE); } catch (e) {}
  vAuth.languageCode = 'az';
  const mail = {
    send(email, u) {
      const url = location.origin + location.pathname + '?verify=' + encodeURIComponent(u);
      try { localStorage.setItem('mf1.vEmail', email); } catch (e) {}
      return vAuth.sendSignInLinkToEmail(email, { url, handleCodeInApp: true });
    },
    async complete() {
      if (!vAuth.isSignInWithEmailLink(location.href)) return null;
      const u = new URL(location.href).searchParams.get('verify');
      let email = null; try { email = localStorage.getItem('mf1.vEmail'); } catch (e) {}
      if (!email) email = prompt('Təsdiq üçün emailini yaz:');
      if (!email) return null;
      await vAuth.signInWithEmailLink(email.trim(), location.href);
      try { await vAuth.signOut(); } catch (e) {}
      history.replaceState(null, '', location.pathname);
      return { u };
    }
  };
  let roomP = null;
  window.claude = {
    fb: true,
    mail,
    use(kind) {
      return ready.then(u => {
        if (kind === 'db') return db;
        if (kind === 'user') return { id: () => Promise.resolve(u.uid), can: () => Promise.resolve(true) };
        if (kind === 'room') return roomP || (roomP = makeRoom(u.uid));
        return null;
      }).catch(() => null);
    }
  };
})();
