// Yeditepe Kampüs · Scriptable · Tasarım 32
// Tek dosya. Harici paket, font veya ikon indirmez.
//
// Kurulum: Eski scriptin tamamını bu dosyayla değiştirin. Uygulamada bir kez
// çalıştırın; ardından küçük, orta veya büyük Scriptable widgetında seçin.
// Önceki sürümün Keychain anahtarları ve önbelleği korunur.
// Kilit ekranı: dikdörtgende iki ders (kat bilgisi olmadan), tek satırda bir ders.
// Yuvarlak: tam ders kodu iki satırda, başlangıç/bitiş, bina harfi ve sınıf.
// Inline bugünün ilk uygun dersini gösterir; ders yoksa boş kalır.
// Kilit ekranı yalnızca dersleri gösterir; aile config.widgetFamily ile seçilir.
// iOS kilit ekranındaki renkleri duvar kâğıdı ve sistem rengine uyarlar.
//
// Öncelik: ders > yemek > sınav. Saat ve konum her ders satırında bulunur.
// Ders kodu solda, saat sağda; tür ve konum ders kodunun altındadır.
// Dersler, bitişe config'deki süre kalana kadar görünür; ilk ders vurgulanır.
// Son dersin bitişinden tam iki saat sonra ertesi günün programına geçilir.
// Sığmayan ders/yemek/sınavlar altta küçük bir +N metin bağlantısıyla belirtilir.
// Kilit ekranında ek sayaç yoktur; dikdörtgende toplam ders sayısı sağ üsttedir.
// Dersler sığmadan yemek/sınav içeriği yer kaplamaz. Artan alana önce yemek,
// ardından sınav eklenir. Kategori ikonları bölüm başına bir kez kullanılır.
//
// İsteğe bağlı parametre: dark (varsayılan), light veya auto.
// Display Zoom/iPad: width=338;height=354 (dış widget ölçüsü, iOS point).
// Önceki menu/courses/exams parametreleri ders önceliğini değiştirmez.
// Widgeta veya sığmayan içerik sayacına dokunmak ayrıntıları açar.
// Ayrıntılar tek bir yerel WebView'da bütün modülleri eksiksiz gösterir.
// HTML, stil ve ikonlar bu dosyadadır; WebView dış kaynak yüklemez.
// ListWidget kayan yazı/scroll animasyonu sunmaz; eklenmedi.
// Geçiş saatlerinde yenileme istenir, gerçek yenileme zamanını iOS belirler.
// Yemek verisi yalnızca aynı İstanbul gününde çekildiyse kullanılır; eski gün
// menüsü gösterilmez. Menü istekleri HTTP önbelleğini atlar.
//
// Tasarım: design-taste-frontend, Colour chapters, seed 1755989833.
// Aynı yerel bileşen yönü: koyu mavi #041329, tek yazı ailesi, düz yüzeyler,
// ortak sol kenarlar. Web hero/fotoğraf/scroll kuralları bu widgeta uygulanmaz.
// Widget ikonları DrawContext; ayrıntılarda aynı kap, tabak, artı SVG çizimleri.
// Üniversite logosu dosyaya gömülüdür; ek dosya veya indirme gerekmez.
// Örnek ders, sınav veya menü verisi bu dosyada bulunmaz.
// iOS üzerinde çalıştırma yapılmadı; kontrol temsili yerleşim ve API mock'uyladır.
// Kimlik bilgileri ve token yalnızca iOS Keychain'de saklanır.
// Öğrenci API kimliği JWT içindeki cci alanından otomatik okunur.

const APP = {
  name: "Yeditepe Kampüs",
  baseURL: "https://api7.yeditepe.edu.tr",
  examDays: 15,
  refreshMinutes: 15,
  // Ders bitişine kaç dakika kala listeden kaldırılsın? 0 = bitince kaldır.
  // Ders bu süreden kısaysa başladığında kaldırılır; başlamadan gizlenmez.
  courseHideMinutesBeforeEnd: 30,
  timeoutSeconds: 12,
  turkeyOffsetMs: 3 * 60 * 60 * 1000,
  keyPrefix: "yeditepe-campus-widget.v1.",
  cacheFolder: "YeditepeCampusWidgetCache-v1",
};

// Kullanıcının sağladığı logo; özgün renkler ve en-boy oranı korunur.
const BRAND_LOGO_BASE64 = "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";
const BRAND_LOGO_ASPECT = 128 / 100;
let brandLogoImage = null;

const OPTIONS = readOptions();
const COLORS = {
  brand: new Color("#4D83E8"),
  background: themeColor("#F4F6F8", "#041329"),
  surface: themeColor("#E5EBF2", "#0B2342"),
  text: themeColor("#16263A", "#F1F4F8"),
  secondary: themeColor("#556477", "#AAB7C8"),
  accent: themeColor("#1764B0", "#8ABEFF"),
  warning: themeColor("#8B520B", "#F2C57C"),
  danger: themeColor("#B3263E", "#FF9AAC"),
};

const KEYS = {
  username: APP.keyPrefix + "username",
  password: APP.keyPrefix + "password",
  token: APP.keyPrefix + "token",
};

const fileManager = FileManager.local();
const cacheDirectory = fileManager.joinPath(
  fileManager.documentsDirectory(),
  APP.cacheFolder
);


async function main() {
  if (!config.runsInWidget) {
    await runInsideApp();
    return;
  }

  const family = supportedFamily(config.widgetFamily);

  if (!hasAccount()) {
    const widget = createSetupWidget(family);
    Script.setWidget(widget);
    return;
  }

  const dashboard = await loadDashboard();
  const widget = createDashboardWidget(family, dashboard);
  Script.setWidget(widget);
}


async function runInsideApp() {
  const section = (args.queryParameters || {}).campus;
  if (hasAccount() && ["menu", "courses", "exams", "all"].includes(section)) {
    await presentDetails(section);
    return;
  }
  if (!hasAccount()) {
    const configured = await configureAccount(false);
    if (!configured) return;
    const family = await choosePreviewFamily();
    if (!family) return;
    await presentDashboard(family);
    return;
  }

  const menu = new Alert();
  menu.title = APP.name;
  menu.message = "Widgetı önizleyebilir veya hesap ayarlarını güncelleyebilirsiniz.";
  menu.addAction("Büyük önizleme");
  menu.addAction("Orta önizleme");
  menu.addAction("Küçük önizleme");
  menu.addAction("Kilit ekranı önizlemesi");
  menu.addAction("Hesap bilgilerini güncelle");
  menu.addAction("Önbelleği temizle");
  menu.addCancelAction("İptal");

  const action = await menu.presentSheet();
  if (action === 0) {
    await presentDashboard("large");
  } else if (action === 1) {
    await presentDashboard("medium");
  } else if (action === 2) {
    await presentDashboard("small");
  } else if (action === 3) {
    const family = await chooseAccessoryPreview();
    if (family) await presentDashboard(family);
  } else if (action === 4) {
    const updated = await configureAccount(true);
    if (updated) await presentDashboard("large");
  } else if (action === 5) {
    clearCache();
    await showMessage("Önbellek temizlendi", "Veriler bir sonraki çalıştırmada yeniden indirilecek.");
  }
}


async function choosePreviewFamily() {
  const picker = new Alert();
  picker.title = "Önizleme";
  picker.message = "Kurulum tamamlandı. Hangi boyutu görmek istersiniz?";
  picker.addAction("Büyük");
  picker.addAction("Orta");
  picker.addAction("Küçük");
  picker.addCancelAction("Daha sonra");
  const selected = await picker.presentSheet();
  if (selected === 0) return "large";
  if (selected === 1) return "medium";
  if (selected === 2) return "small";
  return null;
}


async function chooseAccessoryPreview() {
  const picker = new Alert();
  picker.title = "Kilit ekranı";
  picker.message = "Gerçek renk ve görünüm kilit ekranına göre değişebilir.";
  picker.addAction("Dikdörtgen · iki ders");
  picker.addAction("Yuvarlak · bir ders");
  picker.addAction("Tek satır · bir ders");
  picker.addCancelAction("İptal");
  const selected = await picker.presentSheet();
  return ["accessoryRectangular", "accessoryCircular", "accessoryInline"][selected] || null;
}

async function presentDashboard(family) {
  const dashboard = await loadDashboard();
  const widget = createDashboardWidget(family, dashboard);
  if (family === "accessoryRectangular") {
    await widget.presentAccessoryRectangular();
  } else if (family === "accessoryCircular") {
    await widget.presentAccessoryCircular();
  } else if (family === "accessoryInline") {
    await widget.presentAccessoryInline();
  } else if (family === "small") {
    await widget.presentSmall();
  } else if (family === "medium") {
    await widget.presentMedium();
  } else {
    await widget.presentLarge();
  }
}


async function configureAccount(isUpdate) {
  while (true) {
    const form = new Alert();
    form.title = isUpdate ? "Hesap bilgilerini güncelle" : "Yeditepe hesabını bağla";
    form.message = "Bilgileriniz iOS Keychain'de saklanır. Öğrenci kimliği oturumunuzdan otomatik alınır.";
    form.addTextField("Kullanıcı adı", readKey(KEYS.username));
    form.addSecureTextField("Şifre", readKey(KEYS.password));
    form.addAction("Kaydet ve doğrula");
    form.addCancelAction("İptal");

    const response = await form.presentAlert();
    if (response === -1) return false;

    const username = form.textFieldValue(0).trim();
    const password = form.textFieldValue(1);

    if (!username || !password) {
      await showMessage(
        "Eksik bilgi",
        "Kullanıcı adı ve şifre boş olamaz."
      );
      continue;
    }

    try {
      const token = await login(username, password);
      Keychain.set(KEYS.username, username);
      Keychain.set(KEYS.password, password);
      Keychain.set(KEYS.token, token);
      clearCache();
      return true;
    } catch (error) {
      await showMessage(
        "Giriş doğrulanamadı",
        friendlyError(error) + "\n\nBilgileri kontrol edip yeniden deneyin."
      );
    }
  }
}


function hasAccount() {
  return (
    Keychain.contains(KEYS.username) &&
    Keychain.contains(KEYS.password)
  );
}


function readKey(key) {
  return Keychain.contains(key) ? Keychain.get(key) : "";
}


async function login(username, password) {
  const payload = await requestJSON(APP.baseURL + "/auth/a7login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      app: "a7",
    },
    body: JSON.stringify({
      user: username,
      pass: password,
      rememberMe: true,
    }),
  });

  if (!payload || typeof payload.ta7 !== "string" || payload.ta7.length < 10) {
    throw new Error("Sunucu geçerli bir oturum tokenı döndürmedi.");
  }

  studentIdFromToken(payload.ta7);
  return payload.ta7;
}


function studentIdFromToken(token) {
  try {
    const parts = typeof token === "string" ? token.split(".") : [];
    if (parts.length !== 3 || !parts[0] || !parts[2]) throw new Error();
    const encoded = parts[1];
    if (!/^[A-Za-z0-9_-]+$/.test(encoded) || encoded.length % 4 === 1) throw new Error();
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - base64.length % 4) % 4);
    const data = Data.fromBase64String(padded);
    const decoded = data ? data.toRawString() : null;
    if (!decoded) throw new Error();
    // Burada yalnızca kimlik alanı okunur; oturumu API doğrular.
    const payload = JSON.parse(decoded);
    const cci = payload && payload.cci;
    if (typeof cci !== "string" && typeof cci !== "number") throw new Error();
    if (typeof cci === "number" && (!Number.isSafeInteger(cci) || cci <= 0)) throw new Error();
    const studentId = String(cci).trim();
    if (!/^\d+$/.test(studentId) || /^0+$/.test(studentId)) throw new Error();
    return studentId;
  } catch (_) {
    throw new Error("Oturum tokenındaki öğrenci kimliği (cci) okunamadı. Yeniden giriş yapın.");
  }
}


async function loginWithSavedAccount() {
  if (!hasAccount()) throw new Error("Hesap kurulumu bulunamadı.");
  const token = await login(readKey(KEYS.username), readKey(KEYS.password));
  Keychain.set(KEYS.token, token);
  return token;
}


async function loadDashboard() {
  let token = readKey(KEYS.token);
  let studentId;

  try {
    studentId = studentIdFromToken(token);
  } catch (_) {
    try {
      token = await loginWithSavedAccount();
      studentId = studentIdFromToken(token);
    } catch (error) {
      return dashboardFromCache(error);
    }
  }

  let endpoints = dashboardEndpoints(studentId);

  let results = await Promise.all(
    endpoints.map(function (endpoint) {
      return fetchEndpointResult(endpoint, token);
    })
  );

  const authFailed = results.some(function (result) {
    return !result.ok && isAuthenticationError(result.error);
  });

  if (authFailed) {
    try {
      token = await loginWithSavedAccount();
      const renewedStudentId = studentIdFromToken(token);
      const identityChanged = renewedStudentId !== studentId;
      if (identityChanged) clearCache();
      studentId = renewedStudentId;
      endpoints = dashboardEndpoints(studentId);
      const retryJobs = endpoints.map(function (endpoint, index) {
        if (identityChanged || (!results[index].ok && isAuthenticationError(results[index].error))) {
          return fetchEndpointResult(endpoint, token);
        }
        return Promise.resolve(results[index]);
      });
      results = await Promise.all(retryJobs);
    } catch (loginError) {
      results = results.map(function (result) {
        if (!result.ok && isAuthenticationError(result.error)) {
          return { ok: false, error: loginError };
        }
        return result;
      });
    }
  }

  // A request started before midnight must not become today's menu merely
  // because another endpoint or token renewal finished after midnight.
  const diningIndex = endpoints.findIndex(function (endpoint) { return endpoint.key === "dining"; });
  const diningResult = results[diningIndex];
  if (diningIndex >= 0 && diningResult.ok && Array.isArray(diningResult.value) &&
      !isSameTurkeyDay(diningResult.savedAt, new Date())) {
    results[diningIndex] = await fetchEndpointResult(endpoints[diningIndex], token);
  }

  const resolved = {};
  endpoints.forEach(function (endpoint, index) {
    const result = results[index];
    if (result.ok && Array.isArray(result.value)) {
      writeCache(endpoint.key, result.value, result.savedAt);
      resolved[endpoint.key] = {
        data: result.value,
        stale: false,
        error: null,
        savedAt: result.savedAt,
      };
    } else {
      const error = result.ok
        ? new Error("Sunucudan beklenmeyen veri biçimi geldi.")
        : result.error;
      resolved[endpoint.key] = cacheFallback(endpoint.key, error);
    }
  });

  return buildDashboard(resolved);
}


function dashboardEndpoints(studentId) {
  return [
    {
      key: "schedule",
      url: APP.baseURL + "/student/schedule-all/true/" + encodeURIComponent(studentId),
    },
    {
      key: "dining",
      url: APP.baseURL + "/fb/dining-today",
    },
    {
      key: "exams",
      url:
        APP.baseURL +
        "/student/exam-calendar/true/" +
        encodeURIComponent(studentId) +
        "/" +
        APP.examDays,
    },
  ];

}


function dashboardFromCache(error) {
  return buildDashboard({
    schedule: cacheFallback("schedule", error),
    dining: cacheFallback("dining", error),
    exams: cacheFallback("exams", error),
  });
}


async function fetchEndpoint(endpoint, token) {
  let url = endpoint.url;
  const headers = authenticatedHeaders(token);
  if (endpoint.key === "dining") {
    // A new cache key plus explicit revalidation avoids re-dating a cached HTTP body.
    url += (url.includes("?") ? "&" : "?") + "_=" + Date.now();
    headers["Cache-Control"] = "no-cache, no-store, max-age=0";
    headers.Pragma = "no-cache";
  }
  return await requestJSON(url, {
    method: "GET",
    headers: headers,
  });
}

async function fetchEndpointResult(endpoint, token) {
  const fetchedAt = Date.now();
  const result = await settled(fetchEndpoint(endpoint, token));
  if (result.ok) result.savedAt = fetchedAt;
  return result;
}

function isSameTurkeyDay(timestamp, now) {
  if (typeof timestamp !== "number" || !isFinite(timestamp)) return false;
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return false;
  const saved = turkeyParts(date), today = turkeyParts(now);
  return saved.year === today.year && saved.month === today.month && saved.day === today.day;
}


function authenticatedHeaders(token) {
  return {
    Authorization: "Bearer " + token,
    Accept: "application/json, text/plain, */*",
    app: "a7",
    Referer: "https://a7.yeditepe.edu.tr/",
  };
}


async function requestJSON(url, options) {
  const request = new Request(url);
  request.method = options.method || "GET";
  request.headers = options.headers || {};
  request.timeoutInterval = APP.timeoutSeconds;
  if (options.body !== undefined) request.body = options.body;

  let raw;
  try {
    raw = await request.loadString();
  } catch (networkError) {
    const wrapped = new Error("Ağ bağlantısı kurulamadı.");
    wrapped.cause = networkError;
    wrapped.status = request.response ? request.response.statusCode : 0;
    throw wrapped;
  }

  const status = request.response ? request.response.statusCode : 200;
  if (status < 200 || status >= 300) {
    const httpError = new Error("Sunucu isteği reddetti (HTTP " + status + ").");
    httpError.status = status;
    throw httpError;
  }

  try {
    return JSON.parse(raw);
  } catch (_) {
    throw new Error("Sunucu yanıtı JSON olarak okunamadı.");
  }
}


function settled(promise) {
  return promise.then(
    function (value) {
      return { ok: true, value: value };
    },
    function (error) {
      return { ok: false, error: error };
    }
  );
}


function isAuthenticationError(error) {
  return error && (error.status === 401 || error.status === 403);
}


function writeCache(key, data, fetchedAt) {
  try {
    ensureCacheDirectory();
    fileManager.writeString(
      cachePath(key),
      JSON.stringify({ savedAt: typeof fetchedAt === "number" ? fetchedAt : Date.now(), data: data })
    );
  } catch (_) {
    // Widget önbellek yazılamasa da canlı veriyle çalışmaya devam eder.
  }
}


function readCache(key) {
  try {
    const path = cachePath(key);
    if (!fileManager.fileExists(path)) return null;
    const parsed = JSON.parse(fileManager.readString(path));
    if (!parsed || !Array.isArray(parsed.data)) return null;
    return parsed;
  } catch (_) {
    return null;
  }
}


function cacheFallback(key, error) {
  const cached = readCache(key);
  if (cached) {
    return {
      data: cached.data,
      stale: true,
      error: error,
      savedAt: cached.savedAt || null,
    };
  }
  return { data: null, stale: true, error: error, savedAt: null };
}


function ensureCacheDirectory() {
  if (!fileManager.fileExists(cacheDirectory)) {
    fileManager.createDirectory(cacheDirectory, true);
  }
}


function cachePath(key) {
  return fileManager.joinPath(cacheDirectory, key + ".json");
}


function clearCache() {
  try {
    if (fileManager.fileExists(cacheDirectory)) fileManager.remove(cacheDirectory);
  } catch (_) {
    // Temizleme başarısız olursa bir sonraki yazma işlemi mevcut klasörü kullanır.
  }
}


function buildDashboard(resolved) {
  const now = new Date();
  const scheduleData = resolved.schedule.data || [];
  const diningData = resolved.dining.data || [];
  const examData = resolved.exams.data || [];

  const statuses = [resolved.schedule, resolved.dining, resolved.exams];
  const staleSources = statuses.filter(function (source) {
    return source.stale && source.data !== null;
  });
  const missingSources = statuses.filter(function (source) {
    return source.data === null;
  });

  const savedTimes = staleSources
    .map(function (source) {
      return source.savedAt;
    })
    .filter(function (value) {
      return typeof value === "number";
    });

  const menuOutdated = !isSameTurkeyDay(resolved.dining.savedAt, now);
  return {
    now: now,
    coursesUnavailable: resolved.schedule.data === null,
    menuUnavailable: resolved.dining.data === null,
    examsUnavailable: resolved.exams.data === null,
    scheduleStale: resolved.schedule.stale,
    menuOutdated: menuOutdated,
    courses: selectCourses(scheduleData, now),
    menu: menuOutdated ? [] : selectStudentMenu(diningData),
    exams: selectExams(examData, now),
    stale: staleSources.length > 0,
    missingCount: missingSources.length,
    cacheTime: savedTimes.length ? Math.min.apply(null, savedTimes) : null,
    errors: statuses
      .map(function (source) {
        return source.error;
      })
      .filter(Boolean),
  };
}


function courseVisibleUntil(course) {
  const configured = Number(APP.courseHideMinutesBeforeEnd);
  const minutes = isFinite(configured) ? Math.max(0, configured) : 30;
  return Math.max(course.startAt, course.endAt - minutes * 60000);
}

function selectCourses(schedule, now) {
  const clock = turkeyParts(now);
  const midnight = Date.UTC(clock.year, clock.month - 1, clock.day) - APP.turkeyOffsetMs;
  const valid = schedule.filter(function (course) {
    if (!course || typeof course !== "object") return false;
    const start = clockHour(course.startHour), end = clockHour(course.endHour);
    return Number(course.approved) === 1 && String(course.typeShort || "").toUpperCase() !== "EXM" &&
      Number(course.day) >= 1 && Number(course.day) <= 7 && start !== null && end !== null && start < 24 && start !== end;
  });
  function dayCourses(offset) {
    const weekday = ((clock.weekday - 1 + offset + 7) % 7) + 1;
    return valid.filter(function (course) { return Number(course.day) === weekday; })
      .map(function (course) { return normalizeCourse(course, now, midnight + offset * 86400000, offset); })
      .sort(function (a, b) { return a.startAt - b.startAt || a.endAt - b.endAt; });
  }
  const yesterday = dayCourses(-1), today = dayCourses(0), tomorrow = dayCourses(1);
  const lastYesterday = yesterday.reduce(function (latest, course) { return Math.max(latest, course.endAt); }, 0);
  const firstToday = today.length ? today[0].startAt : Infinity;
  // Preserve a late previous day's two-hour grace period across midnight.
  const carryPrevious = lastYesterday > midnight - 7200000 && now.getTime() < lastYesterday + 7200000 && now.getTime() < firstToday;
  const selected = carryPrevious ? yesterday : yesterday.filter(function (course) {
    return courseVisibleUntil(course) > now.getTime();
  }).concat(today);
  const lastEnd = selected.reduce(function (latest, course) { return Math.max(latest, course.endAt); }, 0);
  const graceEnd = lastEnd ? lastEnd + 7200000 : null;
  const remaining = selected.filter(function (course) { return courseVisibleUntil(course) > now.getTime(); });
  let mode, phase, items, allItems, displayOffset;
  if (remaining.length) {
    mode = "today"; items = remaining; allItems = selected; displayOffset = carryPrevious ? -1 : 0;
    phase = selected.some(function (course) { return course.current; }) ? "current" :
      remaining.length === selected.length ? "morning" : "between";
  } else if (selected.length && now.getTime() < graceEnd) {
    mode = now.getTime() < lastEnd ? "waiting" : "done"; phase = mode;
    items = []; allItems = selected; displayOffset = carryPrevious ? -1 : 0;
  } else {
    const targetOffset = selected.length ? (carryPrevious ? 0 : 1) : lastYesterday > midnight - 7200000 ? 0 : 1;
    items = (targetOffset === 0 ? today : tomorrow).filter(function (course) { return courseVisibleUntil(course) > now.getTime(); });
    allItems = items; displayOffset = targetOffset;
    mode = items.length ? (targetOffset === 0 ? "today" : "tomorrow") : "empty";
    phase = items.length ? (targetOffset === 0 ? "morning" : "tomorrow") : "free";
  }
  const boundaries = [];
  selected.forEach(function (course) {
    if (course.startAt > now.getTime()) boundaries.push(course.startAt);
    const hideAt = courseVisibleUntil(course);
    if (hideAt > now.getTime()) boundaries.push(hideAt);
    if (course.endAt > now.getTime()) boundaries.push(course.endAt);
  });
  if (graceEnd && graceEnd > now.getTime()) boundaries.push(graceEnd);
  const tomorrowBoundary = midnight + 86400000;
  if (tomorrowBoundary > now.getTime()) boundaries.push(tomorrowBoundary);
  return { mode: mode, phase: phase, items: items, allItems: allItems, displayOffset: displayOffset,
    todayItems: yesterday.concat(today).filter(function (course) { return courseVisibleUntil(course) > now.getTime(); }),
    title: displayOffset === 1 ? "Yarınki dersler" : "Bugünün dersleri",
    nextChangeAt: boundaries.length ? Math.min.apply(null, boundaries) : null,
    graceUntil: graceEnd, totalCount: allItems.length };
}

function clockHour(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const match = String(value).trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  const number = match ? Number(match[1]) + Number(match[2]) / 60 : Number(value);
  if (match && Number(match[2]) > 59) return null;
  return isFinite(number) && number >= 0 && number <= 24 ? number : null;
}

function normalizeCourse(course, now, dayStart, offset) {
  const startHour = clockHour(course.startHour), endHour = clockHour(course.endHour);
  const startAt = dayStart + startHour * 3600000;
  const endAt = dayStart + (endHour <= startHour ? endHour + 24 : endHour) * 3600000;
  const rawBuilding = firstUseful([course.building, course.buildingName, course.buildingShort]) || "";
  const building = rawBuilding.length > 4 ? titleCaseFood(rawBuilding) : rawBuilding;
  const buildingShort = firstUseful([course.buildingShort]) || building;
  const floor = firstUseful([course.floor, course.floorName, course.roomFloor, course.floorShort]) || "";
  const room = firstUseful([course.room, course.roomName]) || "";
  const floorLong = floor ? (/^-?\d+$/.test(floor) ? floor + ". Kat" : floor) : "";
  const floorShort = floor ? (/^-?\d+$/.test(floor) ? "Kat " + floor : floor.replace(/(\d+)\.\s*kat/i, "Kat $1")) : "";
  const compactBuilding = abbreviateBuilding(buildingShort);
  const compactRoom = room.replace(/\s+/g, "").replace(/([a-z])[-–](\d)/ig, "$1$2");
  const location = [building, floorLong, room].filter(Boolean).join(" · ") || "Konum belirtilmedi";
  const locationWidget = [firstUseful([course.buildingShort]) || compactBuilding, floorShort, compactRoom]
    .filter(Boolean).join(" · ") || "Konum yok";
  const locationCompact = [compactBuilding, floorShort, compactRoom].filter(Boolean).join(" · ") || "Konum yok";
  const locationTiny = [compactBuilding.length > 14 ? compactBuilding.slice(0, 11) + "." : compactBuilding,
    floorShort.replace(/Kat\s*/i, "K"), compactRoom].filter(Boolean).join(" · ") || "Konum yok";
  return { typeShort: (firstUseful([course.typeShort]) || "").toUpperCase(),
    code: firstUseful([course.course, course.courseCode]) || "Ders", name: firstUseful([course.courseName, course.courseNameTr]) || "",
    startHour: startHour, endHour: endHour, time: formatHour(startHour) + "–" + formatHour(endHour),
    startAt: startAt, endAt: endAt, location: location, locationWidget: locationWidget, locationCompact: locationCompact, locationTiny: locationTiny,
    building: building, floor: floor, room: room, current: now.getTime() >= startAt && now.getTime() < endAt, dayOffset: offset };
}

function abbreviateBuilding(value) {
  return String(value).replace(/Mühendislik(?:\s*(?:Fakültesi|Binası))?/gi, "Müh.")
    .replace(/Fen[\s-]*Edebiyat(?:\s*(?:Fakültesi|Binası))?/gi, "Fen-Edb.")
    .replace(/İktisadi\s*(?:ve\s*)?İdari\s*Bilimler(?:\s*Fakültesi)?/gi, "İİBF")
    .replace(/Güzel\s*Sanatlar(?:\s*Fakültesi)?/gi, "G.Sanat")
    .replace(/(?:Fakültesi|Binası)/gi, "").replace(/\s+/g, " ").trim();
}


function compareCourses(a, b) {
  return (
    Number(a.day) - Number(b.day) ||
    Number(a.startHour) - Number(b.startHour) ||
    Number(a.endHour) - Number(b.endHour)
  );
}


function selectStudentMenu(rows) {
  const studentRow = rows.find(function (row) {
    return row && normalizeTurkish(row.category) === "ogrenci";
  });

  if (!studentRow) return [];

  return [
    { key: "soup", items: parseFoodList(studentRow.soup) },
    { key: "main", items: parseFoodList(studentRow.main) },
    { key: "optional", items: parseFoodList(studentRow.optional) },
  ].filter(function (category) {
    return category.items.length > 0;
  });
}


function parseFoodList(value) {
  if (!useful(value)) return [];
  const entries = [];
  let current = "", depth = 0;
  for (const character of String(value)) {
    if (character === "(") depth += 1;
    if (character === ")") depth = Math.max(0, depth - 1);
    if (depth === 0 && /[,;\n\r]/.test(character)) {
      if (current.trim()) entries.push(current.trim());
      current = "";
    } else current += character;
  }
  if (current.trim()) entries.push(current.trim());
  return entries.filter(useful).map(function (entry) {
    const match = entry.match(/^(.*?)\s*\(([\d.,]+)\s*kcal\)\s*$/i);
    return { name: titleCaseFood(match ? match[1].trim() : entry), kcal: match ? match[2].replace(",", ".") : null };
  }).filter(function (item) { return useful(item.name); });
}


function titleCaseFood(value) {
  const text = String(value).trim();
  if (!text || text !== text.toLocaleUpperCase("tr-TR")) return text;
  return text
    .toLocaleLowerCase("tr-TR")
    .replace(/(^|[\s/-])([a-zçğıöşü])/g, function (_, prefix, letter) {
      return prefix + letter.toLocaleUpperCase("tr-TR");
    });
}


function selectExams(rows, now) {
  const today = turkeyParts(now);
  const todayStamp = Date.UTC(today.year, today.month - 1, today.day);

  return rows
    .map(function (exam) {
      if (!exam || typeof exam !== "object") return null;
      const date = new Date(exam.date);
      if (isNaN(date.getTime())) return null;
      const parts = turkeyParts(date);
      const dateStamp = Date.UTC(parts.year, parts.month - 1, parts.day);
      const remainingDays = Math.round((dateStamp - todayStamp) / 86400000);
      if (remainingDays < 0) return null;

      return {
        courseName: firstUseful([exam.courseName, exam.courseNameEn]) || "Sınav",
        courseCode: firstUseful([exam.courseCode, exam.course]) || "",
        type: firstUseful([exam.typeTr, exam.typeEn]) || "Sınav",
        weight:
          exam.weight === null || exam.weight === undefined || exam.weight === ""
            ? null
            : Number(exam.weight),
        hour: useful(exam.hour) ? normalizeExamHour(exam.hour) : null,
        remainingDays: remainingDays,
        remainingLabel:
          remainingDays === 0
            ? "Bugün"
            : remainingDays === 1
            ? "Yarın"
            : remainingDays + " gün",
        dateLabel:
          parts.day + " " + MONTHS[parts.month - 1] + " " + WEEKDAYS[parts.weekday - 1],
        timestamp: dateStamp,
      };
    })
    .filter(Boolean)
    .sort(function (a, b) {
      return a.timestamp - b.timestamp || String(a.hour || "").localeCompare(String(b.hour || ""));
    });
}


function normalizeExamHour(value) {
  const text = String(value).trim();
  const match = text.match(/^(\d{1,2})(?::(\d{2}))?/);
  if (!match) return text;
  return String(Number(match[1])).padStart(2, "0") + ":" + (match[2] || "00");
}


// Native UI: all dimensions below are iOS points, not CSS pixels.
function readOptions() {
  const tokens = String(args.widgetParameter || "").toLowerCase().split(/[;,\s]+/);
  const options = { focus: "auto", theme: "dark", width: 0, height: 0 };
  const linkedTheme = (args.queryParameters || {}).theme;
  if (["light", "dark", "auto"].includes(linkedTheme)) options.theme = linkedTheme;
  tokens.forEach(function (token) {
    if (["menu", "courses", "exams"].includes(token)) options.focus = token;
    if (["light", "dark", "auto"].includes(token)) options.theme = token;
    const match = token.match(/^(width|height)=(\d{2,4})$/);
    if (match) options[match[1]] = Math.max(120, Math.min(1000, Number(match[2])));
  });
  return options;
}

function themeColor(light, dark) {
  if (OPTIONS.theme === "light") return new Color(light);
  if (OPTIONS.theme === "dark") return new Color(dark);
  return Color.dynamic(new Color(light), new Color(dark));
}

function widgetMetrics(family) {
  const screen = Device.screenSize();
  const short = Math.min(screen.width, screen.height);
  if (isAccessoryFamily(family)) {
    // Apple HIG point-size guidance; do not reuse home-screen width/height
    // overrides here. Scriptable does not expose the actual accessory frame.
    const tall = Math.max(screen.width, screen.height);
    const compact = short <= 375 && tall < 750;
    if (family === "accessoryCircular") {
      const diameter = short >= 414 ? 76 : compact ? 68 : 72;
      // Keep host background padding at zero; inset only the content inside it.
      return { width: diameter, height: diameter, padding: 0 };
    }
    if (family === "accessoryInline") {
      return { width: short >= 420 ? 257 : short >= 414 ? 248 : short >= 390 ? 234 : 225, height: 26, padding: 0 };
    }
    const width = short >= 420 ? 172 : short === 414 && tall < 800 ? 170 : short >= 390 ? 160 : compact ? 153 : 157;
    const height = width >= 170 ? 76 : compact ? 68 : 72;
    return { width: width - 4, height: height - 4, padding: 2 };
  }
  // Conservative point sizes for standard iPhone home-screen grids. iOS does
  // not expose the actual widget frame. Display Zoom / iPad / custom grids can
  // override it in the widget parameter, e.g. width=338;height=354.
  let small = 158, medium = 338, large = 354;
  if (short <= 320) { small = 141; medium = 292; large = 311; }
  else if (short <= 375) { small = 155; medium = 329; large = 345; }
  else if (short >= 414 && short < 420) { small = 169; medium = 360; large = 379; }
  else if (short >= 420 && short < 600) { small = 170; medium = 364; large = 382; }
  const width = OPTIONS.width || (family === "small" ? small : medium);
  const height = OPTIONS.height || (family === "large" ? large : small);
  const padding = family === "small" ? 10 : family === "large" ? 14 : 12;
  return { width: width - 2 * padding, height: height - 2 * padding, padding: padding };
}

function isAccessoryFamily(value) {
  return ["accessoryRectangular", "accessoryInline", "accessoryCircular"].includes(value);
}

function supportedFamily(value) {
  return isAccessoryFamily(value) || ["small", "medium", "large"].includes(value) ? value : "medium";
}

function baseWidget(family) {
  const widget = new ListWidget();
  const m = widgetMetrics(family);
  if (isAccessoryFamily(family)) {
    // Leave the native accessory ground transparent; iOS supplies its tint.
    widget.addAccessoryWidgetBackground = false;
  } else widget.backgroundColor = COLORS.background;
  widget.setPadding(m.padding, m.padding, m.padding, m.padding);
  widget.url = detailURL("all");
  return widget;
}

function box(parent, width, height, horizontal) {
  const stack = parent.addStack();
  if (horizontal) stack.layoutHorizontally(); else stack.layoutVertically();
  stack.size = new Size(Math.max(0, width), Math.max(0, height));
  stack.setPadding(0, 0, 0, 0);
  return stack;
}

function text(parent, value, size, weight, color, lines) {
  const node = parent.addText(String(value));
  node.font = weight === "bold" ? Font.boldSystemFont(size) :
    weight === "medium" ? Font.mediumSystemFont(size) :
    weight === "semibold" ? Font.semiboldSystemFont(size) : Font.systemFont(size);
  node.textColor = color || COLORS.text;
  node.lineLimit = lines || 1;
  node.minimumScaleFactor = 0.88;
  return node;
}

function symbolImage(name, size) {
  const symbol = SFSymbol.named(name) || SFSymbol.named("fork.knife") || SFSymbol.named("circle");
  if (!symbol) return null;
  symbol.applyFont(Font.systemFont(size));
  return symbol.image;
}

function icon(parent, name, size, color) {
  const image = symbolImage(name, size);
  if (!image) return;
  const node = parent.addImage(image);
  node.imageSize = new Size(size, size);
  node.tintColor = color || COLORS.secondary;
  node.applyFittingContentMode();
}

function flattenMenu(menu) {
  return menu.reduce(function (all, category) {
    return all.concat(category.items.map(function (item) {
      return { name: item.name, kcal: item.kcal, key: category.key };
    }));
  }, []);
}

function detailURL(section) {
  const url = URLScheme.forRunningScript();
  return url + (url.includes("?") ? "&" : "?") + "campus=" + encodeURIComponent(section) + "&theme=" + encodeURIComponent(OPTIONS.theme);
}

function addBrandLogo(parent, height) {
  if (!brandLogoImage) {
    const data = Data.fromBase64String(BRAND_LOGO_BASE64);
    if (data) brandLogoImage = Image.fromData(data);
  }
  if (!brandLogoImage) return;
  const logo = parent.addImage(brandLogoImage);
  logo.imageSize = new Size(height * BRAND_LOGO_ASPECT, height);
  logo.applyFittingContentMode();
  parent.addSpacer(4);
}

function renderHeader(parent, family, dashboard, width) {
  const row = box(parent, width, 18, true);
  row.centerAlignContent();
  addBrandLogo(row, family === "small" ? 12 : 13);
  text(row, "Yeditepe", family === "small" ? 12 : 13, "semibold", COLORS.brand);
  row.addSpacer();
  if (dashboard && (dashboard.stale || dashboard.missingCount > 0 || dashboard.menuOutdated)) {
    icon(row, dashboard.stale ? "clock.arrow.circlepath" : "exclamationmark.circle", 12, COLORS.warning);
    row.addSpacer(5);
  }
  const p = turkeyParts(dashboard ? dashboard.now : new Date());
  text(row, p.day + " " + MONTHS[p.month - 1], 11, "regular", COLORS.secondary);
}

// Measure first, then render: lower-priority modules never hide a course.
function courseProfiles(width) {
  if (width >= 170) return [
    { row: 32, head: 16, code: 12, time: 10, location: 10 },
    { row: 27, head: 14, code: 11, time: 9.5, location: 9 },
    { row: 24, head: 13, code: 10, time: 9, location: 8.5 }
  ];
  return [
    { row: 29, head: 15, code: width < 130 ? 10.5 : 11.5, time: width < 130 ? 9 : 9.5, location: 9 },
    { row: 25, head: 13, code: 10.5, time: 9, location: 8.5 },
    { row: 23, head: 12, code: 10, time: 8.5, location: 8.2 }
  ];
}

function courseBlockPlan(state, width, maxHeight, unavailable) {
  const items = state.items || [];
  if (!items.length) return { height: Math.min(18, maxHeight), items: [], hidden: 0, status: true, unavailable: unavailable };
  const profiles = courseProfiles(width);
  const profile = Object.assign({}, profiles.find(function (p) { return p.head + items.length * p.row <= maxHeight; }) || profiles[profiles.length - 1]);
  const visible = Math.min(items.length, Math.max(0, Math.floor((maxHeight - profile.head) / profile.row)));
  const hidden = items.length - visible;
  const rows = items.slice(0, visible).map(function (course, index) {
    return { course: course, height: profile.row, highlighted: index === 0 };
  });
  return { height: profile.head + rows.reduce(function (sum, row) { return sum + row.height; }, 0),
    items: rows, hidden: hidden, profile: profile, title: state.title, status: false };
}

function foodRowMetrics(food, columnWidth) {
  const showCalories = columnWidth >= 145;
  const valueWidth = showCalories ? Math.max(25, 8 + String(food.kcal || "—").length * 5.5) : 0;
  const gap = showCalories ? 6 : 0;
  return { showCalories: showCalories, valueWidth: valueWidth, gap: gap,
    nameWidth: Math.max(1, columnWidth - 18 - gap - valueWidth) };
}

function menuDensePlan(menu, width, maxHeight, trailingRoom) {
  if (!menu.length) return null;
  const groups = menu.filter(function (group) { return group.items.length; });
  const splitAt = groups.findIndex(function (group) { return group.key === "optional"; });
  const twoColumns = width >= 280 && groups.length > 1;
  // In the right-hand medium column, compensate the native trailing alignment
  // spacer inside the outer padding so long names can reach the date's edge.
  const trailingWidth = !twoColumns && width < 145 ? Math.max(0, Math.min(Number(trailingRoom || 0), 144 - width)) : 0;
  const gap = 10, colWidth = twoColumns ? (width - gap) / 2 : width + trailingWidth;
  const columns = twoColumns ? [groups.slice(0, splitAt > 0 ? splitAt : 1), groups.slice(splitAt > 0 ? splitAt : 1)] : [groups];
  const head = width >= 280 ? 14 : 16, titleGap = 3;
  const rowHeight = width < 170 ? 13 : width >= 280 ? 14 : 16, groupGap = 2;
  const budget = maxHeight - head - titleGap;
  let shown = 0;
  const plans = columns.map(function (columnGroups) {
    const selected = [];
    let used = 0;
    columnGroups.forEach(function (group) {
      const extra = selected.length ? groupGap : 0;
      if (used + extra + rowHeight <= budget) {
        selected.push({ key: group.key, items: [group.items[0]] }); used += extra + rowHeight;
      }
    });
    let added = true;
    while (added) {
      added = false;
      selected.forEach(function (group) {
        const full = columnGroups.find(function (entry) { return entry.key === group.key; });
        if (group.items.length < full.items.length && used + rowHeight <= budget) {
          group.items.push(full.items[group.items.length]); used += rowHeight; added = true;
        }
      });
    }
    // Keep the maximum number of dishes first, then spend spare height on wrapping.
    selected.forEach(function (group) {
      group.rows = group.items.map(function (food) {
        const metrics = foodRowMetrics(food, colWidth);
        const needsWrap = food.name.length * 9.5 * 0.53 > metrics.nameWidth;
        const lines = needsWrap && used + rowHeight <= budget ? 2 : 1;
        if (lines === 2) used += rowHeight;
        return { food: food, lines: lines, height: rowHeight * lines };
      });
    });
    shown += selected.reduce(function (n, group) { return n + group.items.length; }, 0);
    return { groups: selected, height: used };
  });
  if (!shown) return null;
  const total = flattenMenu(menu).length;
  return { height: head + titleGap + Math.max.apply(null, plans.map(function (p) { return p.height; })), head: head, titleGap: titleGap,
    columns: plans, colWidth: colWidth, columnGap: gap, rowHeight: rowHeight, groupGap: groupGap,
    shown: shown, hidden: total - shown, width: width + trailingWidth, trailingWidth: trailingWidth };
}

function examDensePlan(exams, width, maxHeight) {
  if (!exams.length || maxHeight < 43) return null;
  const count = Math.min(exams.length, Math.floor((maxHeight - 16) / 27));
  return count ? { height: 16 + count * 27, items: exams.slice(0, count), hidden: exams.length - count } : null;
}

function secondaryPlan(dashboard, width, maxHeight, trailingRoom) {
  const menu = menuDensePlan(dashboard.menu, width, maxHeight, trailingRoom);
  let used = menu ? menu.height : 0;
  // Food gets all usable room before any exam content is considered.
  const exams = menu && menu.hidden ? null : examDensePlan(dashboard.exams, width, maxHeight - used - (used ? 6 : 0));
  if (exams) used += (used ? 6 : 0) + exams.height;
  return { menu: menu, exams: exams, height: used };
}

function dashboardContentPlan(family, dashboard, width, height) {
  const course = courseBlockPlan(dashboard.courses, width, height, dashboard.coursesUnavailable);
  const gap = course.height ? 6 : 0;
  const rest = course.hidden ? { menu: null, exams: null, height: 0 } : secondaryPlan(dashboard, width, Math.max(0, height - course.height - gap));
  let plan = { layout: "vertical", courses: course, secondary: rest, width: width, height: height };
  // Medium widgets can put the full remaining schedule beside the menu, but
  // only when every course, time and location fits in that narrower column.
  if (family === "medium" && width >= 280 && dashboard.courses.items.length && (dashboard.menu.length || dashboard.exams.length)) {
    const columnGap = 12, courseWidth = Math.floor((width - columnGap) * 0.60), otherWidth = width - columnGap - courseWidth;
    const narrowCourse = courseBlockPlan(dashboard.courses, courseWidth, height, dashboard.coursesUnavailable);
    if (!narrowCourse.hidden) {
      const other = secondaryPlan(dashboard, otherWidth, height, 8);
      const score = function (secondary) { return (secondary.menu ? secondary.menu.shown * 100 : 0) + (secondary.exams ? secondary.exams.items.length : 0); };
      if (score(other) > score(rest)) plan = { layout: "split", courses: narrowCourse, secondary: other,
        courseWidth: courseWidth, otherWidth: otherWidth, gap: columnGap, width: width, height: height };
    }
  }
  return plan;
}

function overflowItems(dashboard, plan) {
  const counts = [
    { key: "courses", count: dashboard.courses.items.length - plan.courses.items.length, label: "ders" },
    { key: "menu", count: flattenMenu(dashboard.menu).length - (plan.secondary.menu ? plan.secondary.menu.shown : 0), label: "yemek" },
    { key: "exams", count: dashboard.exams.length - (plan.secondary.exams ? plan.secondary.exams.items.length : 0), label: "sınav" }
  ];
  return counts.filter(function (item) { return item.count > 0; });
}

function dashboardPlan(family, dashboard, width, height) {
  let plan = dashboardContentPlan(family, dashboard, width, height);
  plan.overflow = overflowItems(dashboard, plan);
  plan.footer = null;
  plan.contentHeight = height;
  if (!plan.overflow.length) return plan;
  const footerHeight = 9, footerGap = 2, reserve = footerHeight + footerGap;
  // Use spare space below either column before reserving a full-width band.
  if (plan.layout === "split") {
    const compactCourses = courseBlockPlan(dashboard.courses, plan.courseWidth, Math.max(0, height - reserve), dashboard.coursesUnavailable);
    if (compactCourses.items.length === plan.courses.items.length) {
      plan.courses = compactCourses;
      plan.footer = { placement: "courses", height: footerHeight, gap: footerGap };
      return plan;
    }
    const label = plan.overflow.map(function (item) { return "+" + item.count + " " + item.label; }).join(", ");
    if (height - plan.secondary.height >= reserve && label.length * 7.5 * 0.53 <= plan.otherWidth) {
      plan.footer = { placement: "secondary", height: footerHeight, gap: footerGap };
      return plan;
    }
  }
  const used = plan.layout === "split" ? Math.max(plan.courses.height, plan.secondary.height) :
    plan.courses.height + (plan.secondary.height ? 6 + plan.secondary.height : 0);
  const contentHeight = Math.max(0, height - reserve);
  if (used > contentHeight) {
    plan = dashboardContentPlan(family, dashboard, width, contentHeight);
    plan.overflow = overflowItems(dashboard, plan);
  }
  if (!plan.overflow.length) {
    plan.contentHeight = height;
    plan.footer = null;
    return plan;
  }
  plan.contentHeight = contentHeight;
  plan.footer = { placement: "bottom", height: footerHeight, gap: footerGap };
  return plan;
}

function renderOverflowFooter(parent, items, width, height, accessory) {
  if (!items.length) return;
  const label = items.map(function (item) { return "+" + item.count + " " + item.label; }).join(", ");
  const row = box(parent, width, height, true); row.centerAlignContent();
  row.url = detailURL("all");
  const node = accessory ? accessoryText(row, label, 6.5, "regular", 0.85) :
    text(row, label, 7.5, "regular", COLORS.accent);
  node.minimumScaleFactor = 0.75;
  node.url = detailURL("all");
  row.addSpacer(null);
}

function createDashboardWidget(family, dashboard) {
  if (isAccessoryFamily(family)) return createAccessoryWidget(family, dashboard);
  const widget = baseWidget(family), m = widgetMetrics(family);
  const root = box(widget, m.width, m.height, false);
  const headerHeight = family === "small" ? 14 : family === "medium" ? 16 : 18;
  const headerGap = family === "large" ? 6 : 3;
  renderHeaderV4(root, dashboard, m.width, headerHeight, family);
  root.addSpacer(headerGap);
  const bodyHeight = Math.max(0, m.height - headerHeight - headerGap);
  const plan = dashboardPlan(family, dashboard, m.width, bodyHeight);
  const contentHeight = plan.contentHeight;
  const body = box(root, m.width, contentHeight, false);
  if (plan.layout === "split") {
    const columns = box(body, m.width, contentHeight, true);
    columns.topAlignContent();
    const courseColumn = box(columns, plan.courseWidth, contentHeight, false);
    renderCoursePlan(courseColumn, dashboard, plan.courses, plan.courseWidth, family);
    if (plan.footer && plan.footer.placement === "courses") {
      courseColumn.addSpacer(contentHeight - plan.courses.height - plan.footer.height);
      renderOverflowFooter(courseColumn, plan.overflow, plan.courseWidth, plan.footer.height, false);
    }
    columns.addSpacer(plan.gap);
    const otherColumn = box(columns, plan.otherWidth, contentHeight, false);
    const secondaryFooter = plan.footer && plan.footer.placement === "secondary";
    renderSecondaryPlan(otherColumn, dashboard, plan.secondary, plan.otherWidth,
      contentHeight - (secondaryFooter ? plan.footer.height + plan.footer.gap : 0));
    if (secondaryFooter) {
      otherColumn.addSpacer(plan.footer.gap);
      renderOverflowFooter(otherColumn, plan.overflow, plan.otherWidth, plan.footer.height, false);
    }
  } else {
    renderCoursePlan(body, dashboard, plan.courses, m.width, family);
    if (plan.secondary.height) {
      body.addSpacer(6);
      renderSecondaryPlan(body, dashboard, plan.secondary, m.width, plan.secondary.height);
    }
    const used = plan.courses.height + (plan.secondary.height ? 6 + plan.secondary.height : 0);
    if (used < contentHeight) body.addSpacer(contentHeight - used);
  }
  if (plan.footer && plan.footer.placement === "bottom") {
    root.addSpacer(plan.footer.gap);
    renderOverflowFooter(root, plan.overflow, m.width, plan.footer.height, false);
  }
  widget.url = detailURL("all");
  widget.refreshAfterDate = nextRefresh(dashboard);
  return widget;
}

function renderHeaderV4(parent, dashboard, width, height, family) {
  const row = box(parent, width, height, true); row.centerAlignContent();
  addBrandLogo(row, family === "small" ? 10 : 12);
  text(row, "Yeditepe", family === "small" ? 10.5 : 12, "semibold", COLORS.brand);
  row.addSpacer();
  if (dashboard.stale || dashboard.missingCount || dashboard.menuOutdated) {
    icon(row, "exclamationmark.circle", 10, COLORS.warning); row.addSpacer(4);
  }
  const date = turkeyParts(dashboard.now);
  text(row, date.day + " " + MONTHS[date.month - 1], family === "small" ? 9 : 10, "regular", COLORS.secondary);
}

function courseLocationLabel(course, location) {
  return [course.typeShort, location].filter(Boolean).join(" · ");
}

function fittingLocation(course, width, size, prefix) {
  const candidates = [course.locationWidget, course.locationCompact, course.locationTiny].filter(Boolean)
    .map(function (location) { return courseLocationLabel(course, location); });
  const room = Math.max(20, width - 8 - String(prefix || "").length * size * 0.5);
  return candidates.find(function (value) { return value.length * size * 0.54 <= room; }) || candidates[candidates.length - 1] || "Konum yok";
}

function renderCoursePlan(parent, dashboard, plan, width, family) {
  const panel = box(parent, width, plan.height, false); panel.url = detailURL("courses");
  const state = dashboard.courses;
  if (plan.status) {
    const label = plan.unavailable ? "Ders programı alınamadı" : state.mode === "done" || state.mode === "waiting" ? "Başlayacak ders yok" :
      state.displayOffset === 1 || state.mode === "tomorrow" ? "Yarın ders yok" : "Bugün ders yok";
    const row = box(panel, width, plan.height, true); row.centerAlignContent();
    text(row, label, width < 170 ? 10.5 : 12, "medium", plan.unavailable ? COLORS.warning : COLORS.secondary); row.addSpacer();
    return;
  }
  const p = Object.assign({}, plan.profile);
  if (family === "large") { p.centeredTime = true; p.time += 3; }
  if (family === "medium") { p.location -= 0.5; p.time += 0.75; }
  if (family === "small") {
    p.code += 1; p.location -= 1;
    p.titleExtraHeight = 2;
  }
  const heading = box(panel, width, p.head, true); heading.centerAlignContent();
  const title = width < 170 ? state.mode === "tomorrow" || state.displayOffset === 1 ? "Yarın" : "Dersler" :
    state.mode === "tomorrow" || state.displayOffset === 1 ? "Yarınki dersler" : "Bugünün dersleri";
  text(heading, title, p.head <= 13 ? 10 : p.head <= 14 ? 11 : 12, "medium", COLORS.secondary); heading.addSpacer();
  text(heading, state.items.length + " ders", 8.5, "regular", COLORS.secondary);
  plan.items.forEach(function (row) { renderCompactCourse(panel, row, width, p); });
}

function renderCompactCourse(parent, entry, width, profile) {
  const course = entry.course, row = box(parent, width, entry.height, !!profile.centeredTime);
  row.url = detailURL("courses");
  row.setPadding(0, 3, 0, 3);
  const innerWidth = width - 6;
  if (entry.highlighted) { row.backgroundColor = COLORS.surface; row.cornerRadius = 6; }
  if (profile.centeredTime) {
    const gap = 8, timeWidth = Math.ceil(course.time.length * profile.time * 0.56 + 1);
    const infoWidth = Math.max(1, innerWidth - timeWidth - gap);
    const info = box(row, infoWidth, entry.height, false);
    const topH = Math.ceil(profile.code * 1.2);
    const code = box(info, infoWidth, topH, true); code.centerAlignContent();
    const section = text(code, course.code, profile.code, "semibold", COLORS.text);
    section.minimumScaleFactor = 0.72; code.addSpacer();
    const location = box(info, infoWidth, entry.height - topH, true); location.centerAlignContent();
    const label = text(location, fittingLocation(course, infoWidth, profile.location), profile.location, "regular", COLORS.secondary);
    label.minimumScaleFactor = 0.72; location.addSpacer();
    row.addSpacer(gap);
    const timeCell = box(row, timeWidth, entry.height, true); timeCell.centerAlignContent(); timeCell.addSpacer();
    const time = text(timeCell, course.time, profile.time, "regular", COLORS.text); time.minimumScaleFactor = 0.78;
    return;
  }
  const topH = profile.titleExtraHeight
    ? Math.min(entry.height - Math.ceil(profile.location * 1.2), Math.ceil(profile.code * 1.2) + profile.titleExtraHeight)
    : Math.ceil(profile.code * 1.2);
  const top = box(row, innerWidth, topH, true); top.centerAlignContent();
  // Reserve the time's own width so long course codes cannot displace it.
  const gap = 4, timeWidth = Math.ceil(course.time.length * profile.time * 0.56 + 1);
  const code = box(top, Math.max(1, innerWidth - timeWidth - gap), topH, true); code.centerAlignContent();
  const section = text(code, course.code, profile.code, "semibold", COLORS.text);
  section.minimumScaleFactor = width < 130 ? 0.60 : 0.72;
  code.addSpacer(); top.addSpacer(gap);
  const timeCell = box(top, timeWidth, topH, true); timeCell.centerAlignContent(); timeCell.addSpacer();
  const time = text(timeCell, course.time, profile.time, "regular", COLORS.text); time.minimumScaleFactor = 0.78;
  const location = box(row, innerWidth, entry.height - topH, true); location.centerAlignContent();
  const label = text(location, fittingLocation(course, innerWidth, profile.location), profile.location, "regular", COLORS.secondary);
  label.minimumScaleFactor = 0.72; location.addSpacer();
}

function renderSecondaryPlan(parent, dashboard, plan, width, height) {
  const panel = box(parent, width, height, false);
  if (plan.menu) renderDenseMenu(panel, dashboard.menu, plan.menu, width);
  if (plan.exams) {
    if (plan.menu) panel.addSpacer(6);
    renderDenseExams(panel, plan.exams, width);
  }
  if (plan.height < height) panel.addSpacer(height - plan.height);
}

function renderDenseMenu(parent, menu, plan, width) {
  width = plan.width;
  const panel = box(parent, width, plan.height, false); panel.url = detailURL("menu");
  const showCalories = plan.colWidth >= 145;
  const title = box(panel, width, plan.head, true); title.centerAlignContent();
  text(title, "Menü", 11.5, "semibold"); title.addSpacer();
  const note = showCalories ? "kcal" : "";
  if (note) text(title, note, 8, "regular", COLORS.secondary);
  panel.addSpacer(plan.titleGap);
  const contentHeight = plan.height - plan.head - plan.titleGap;
  const columns = box(panel, width, contentHeight, true);
  plan.columns.forEach(function (column, index) {
    if (index) columns.addSpacer(plan.columnGap);
    const col = box(columns, plan.colWidth, contentHeight, false);
    column.groups.forEach(function (group, groupIndex) {
      if (groupIndex) col.addSpacer(plan.groupGap);
      const groupH = group.rows.reduce(function (height, entry) { return height + entry.height; }, 0);
      const line = box(col, plan.colWidth, groupH, true);
      const glyph = box(line, 14, groupH, false);
      const iconTop = (group.rows[0].height - 12) / 2;
      glyph.addSpacer(iconTop); addMenuSectionIcon(glyph, group.key, 12);
      glyph.addSpacer(Math.max(0, groupH - iconTop - 12)); line.addSpacer(4);
      const names = box(line, plan.colWidth - 18, groupH, false);
      group.rows.forEach(function (entry) {
        const food = entry.food, metrics = foodRowMetrics(food, plan.colWidth);
        const row = box(names, plan.colWidth - 18, entry.height, true); row.centerAlignContent();
        const nameCell = box(row, metrics.nameWidth, entry.height, true); nameCell.centerAlignContent();
        const name = text(nameCell, food.name, 9.5, "regular", COLORS.text, entry.lines);
        name.minimumScaleFactor = 1;
        // Keep every name at the same leading edge, including wrapped/truncated text.
        nameCell.addSpacer(null);
        if (showCalories) {
          row.addSpacer(metrics.gap);
          const value = box(row, metrics.valueWidth, entry.height, true); value.centerAlignContent(); value.addSpacer();
          const kcal = text(value, food.kcal || "—", 8.5, "regular", COLORS.secondary); kcal.minimumScaleFactor = 0.75;
        }
      });
    });
    if (column.height < contentHeight) col.addSpacer(contentHeight - column.height);
  });
}

function renderDenseExams(parent, plan, width) {
  const panel = box(parent, width, plan.height, false); panel.url = detailURL("exams");
  const title = box(panel, width, 16, true); title.centerAlignContent();
  text(title, "Sınavlar", 11.5, "semibold"); title.addSpacer();
  plan.items.forEach(function (exam) {
    const item = box(panel, width, 27, false);
    const top = box(item, width, 14, true); top.centerAlignContent();
    text(top, exam.courseCode || exam.courseName, 10.5, "semibold"); top.addSpacer();
    text(top, exam.remainingLabel, 9, "medium", exam.remainingDays <= 1 ? COLORS.warning : COLORS.accent);
    const detail = box(item, width, 13, true); detail.centerAlignContent();
    text(detail, exam.dateLabel + (exam.hour ? " · " + exam.hour : ""), 8.5, "regular", COLORS.secondary); detail.addSpacer();
  });
}

const MENU_ICON_IMAGES = {};
function addMenuSectionIcon(parent, key, size) {
  if (!MENU_ICON_IMAGES[key]) {
    const drawing = new DrawContext();
    drawing.size = new Size(24, 24);
    drawing.opaque = false;
    drawing.respectScreenScale = true;
    drawing.setStrokeColor(new Color("#FFFFFF"));
    drawing.setLineWidth(1.7);
    const path = new Path();
    if (key === "soup") {
      drawing.strokeEllipse(new Rect(3, 8, 18, 5));
      path.move(new Point(3, 10.5));
      path.addCurve(new Point(21, 10.5), new Point(5, 24), new Point(19, 24));
      path.move(new Point(8, 21)); path.addLine(new Point(16, 21));
      path.move(new Point(9, 3)); path.addLine(new Point(9, 5.5));
      path.move(new Point(15, 3)); path.addLine(new Point(15, 5.5));
    } else if (key === "main") {
      drawing.strokeEllipse(new Rect(2.5, 2.5, 19, 19));
      drawing.strokeEllipse(new Rect(6, 6, 12, 12));
    } else {
      path.move(new Point(5, 12)); path.addLine(new Point(19, 12));
      path.move(new Point(12, 5)); path.addLine(new Point(12, 19));
    }
    if (key !== "main") {
      drawing.addPath(path);
      drawing.strokePath();
    }
    MENU_ICON_IMAGES[key] = drawing.getImage();
  }
  const image = parent.addImage(MENU_ICON_IMAGES[key]);
  image.imageSize = new Size(size, size);
  image.tintColor = COLORS.secondary;
  image.applyFittingContentMode();
}

function renderEmptyState(parent, dashboard, width, height) {
  icon(parent, dashboard.missingCount ? "wifi.exclamationmark" : "calendar", 20, COLORS.accent);
  parent.addSpacer(8);
  text(parent, dashboard.missingCount ? "Bağlantı kurulamadı" : "Bugün için bilgi yok", width < 180 ? 18 : 23, "semibold", COLORS.text, 2);
  parent.addSpacer(6);
  text(parent, dashboard.missingCount ? "Hesabı ve bağlantıyı kontrol etmek için dokun." :
    dashboard.menuOutdated ? "Bugünün menüsü henüz doğrulanamadı." : "Ders, menü ve sınav bilgileri yayınlandığında burada görünecek.", 12, "regular", COLORS.secondary, width < 180 ? 2 : 3);
  parent.addSpacer();
}

// Lock Screen has its own layout, never the home-screen packing algorithm.
function accessoryText(parent, value, size, weight, opacity, lines) {
  const node = text(parent, value, size, weight, new Color("#FFFFFF"), lines);
  node.textOpacity = opacity === undefined ? 1 : opacity;
  return node;
}

function accessoryDay(dashboard) {
  if (dashboard.courses.displayOffset === 1) return "Yarın";
  const p = turkeyParts(dashboard.now);
  return p.day + " " + MONTHS[p.month - 1];
}

function accessoryStatus(dashboard) {
  if (dashboard.coursesUnavailable) return ["Program alınamadı", "Yenilemek için dokun"];
  if (dashboard.courses.mode === "waiting" || dashboard.courses.mode === "done") return ["Başlayacak ders yok", "Program için dokun"];
  return [dashboard.courses.displayOffset === 1 ? "Yarın ders yok" : "Başlayacak ders yok", "Program için dokun"];
}

function createAccessoryMessage(family, title, subtitle) {
  const widget = baseWidget(family), m = widgetMetrics(family);
  if (family === "accessoryInline") return widget;
  const circular = family === "accessoryCircular";
  if (circular) {
    const content = accessoryCircularContent(widget, m);
    content.addSpacer();
    const message = accessoryCenteredLine(content, title, 24, 8, "semibold", 1, 2);
    message.centerAlignText();
    content.addSpacer();
    return widget;
  }
  const root = box(widget, m.width, m.height, false);
  accessoryText(root, title, circular ? 9 : 12, "semibold", 1, 2);
  if (subtitle) {
    root.addSpacer(3);
    accessoryText(root, subtitle, circular ? 8 : 10, "regular", 0.8, circular ? 2 : 1);
  }
  root.addSpacer();
  return widget;
}

function accessoryCircularContent(widget, metrics) {
  // Use our own slightly smaller disc; the native background has no size knob.
  const diameter = metrics.width - 10, contentWidth = 48, contentHeight = 48;
  const root = box(widget, metrics.width, metrics.height, false);
  const inset = (metrics.width - diameter) / 2;
  root.addSpacer(inset);
  const outer = box(root, metrics.width, diameter, true);
  outer.addSpacer(inset);
  const disc = box(outer, diameter, diameter, false);
  disc.backgroundColor = new Color("#FFFFFF", 0.14);
  disc.cornerRadius = diameter / 2;
  outer.addSpacer(inset);
  root.addSpacer(inset);
  const vertical = (diameter - contentHeight) / 2;
  const horizontal = (diameter - contentWidth) / 2;
  disc.addSpacer(vertical);
  const row = box(disc, diameter, contentHeight, true);
  row.addSpacer(horizontal);
  const content = box(row, contentWidth, contentHeight, false);
  row.addSpacer(horizontal);
  disc.addSpacer(vertical);
  return content;
}

function accessoryCircularCode(course) {
  const code = String(course.code || "Ders").split(".")[0].trim();
  const parts = code.match(/^([^\d]+?)\s*(\d.*)$/);
  return parts ? parts[1].trim() + "\n" + parts[2] : code;
}

function accessoryCenteredLine(parent, value, height, size, weight, opacity, lines) {
  const row = box(parent, parent.size.width, height, true); row.centerAlignContent();
  row.addSpacer();
  const node = accessoryText(row, value, size, weight, opacity, lines);
  node.minimumScaleFactor = 0.75;
  row.addSpacer();
  return node;
}

function accessoryRoom(course) {
  return String(course.room || "").replace(/\s+/g, "").replace(/([a-z])[-–](\d)/ig, "$1$2");
}

function accessoryLocationWithoutFloor(course) {
  const building = String(course.locationCompact || course.locationTiny || "").split(" · ")[0];
  return courseLocationLabel(course, [building, accessoryRoom(course)].filter(Boolean).join(" · ") || "Konum yok");
}

function accessoryCourseLetters(course) {
  return String(course.code || "Ders").replace(/\d.*$/, "").replace(/[\s.\-_/]+$/, "") || "Ders";
}

function accessoryBuildingInitial(course) {
  const building = String(course.building || "").trim();
  const letter = building.match(/[A-Za-zÇĞİÖŞÜçğıöşü]/);
  return letter ? letter[0].toLocaleUpperCase("tr-TR") : "";
}

function inlineHour(value) {
  return formatHour(value).replace(/^0(?=\d)/, "").replace(/:00$/, "");
}

function inlineLocation(course) {
  const floor = String(course.floor === null || course.floor === undefined ? "" : course.floor).trim()
    .replace(/^(?:kat\s*|k(?=[+\d-]))/i, "").replace(/\s*\.?\s*kat$/i, "").trim();
  return [accessoryBuildingInitial(course), floor ? "K" + floor : "", accessoryRoom(course)]
    .filter(Boolean).join(" · ") || "Konum yok";
}

function inlineTodayCourses(dashboard) {
  const now = dashboard.now.getTime(), p = turkeyParts(dashboard.now);
  const candidates = dashboard.courses.todayItems || dashboard.courses.items;
  return candidates.filter(function (course) {
    const day = turkeyParts(new Date(course.startAt));
    const startsToday = day.year === p.year && day.month === p.month && day.day === p.day;
    const ongoing = course.startAt <= now && course.endAt > now;
    return courseVisibleUntil(course) > now && (startsToday || ongoing);
  }).sort(function (a, b) { return a.startAt - b.startAt || a.endAt - b.endAt; });
}

function createInlineCourseWidget(dashboard) {
  const widget = baseWidget("accessoryInline");
  const courses = inlineTodayCourses(dashboard), first = courses[0];
  widget.refreshAfterDate = nextRefresh(dashboard);
  if (dashboard.coursesUnavailable || !first) return widget;
  let label;
  if (first) {
    // Inline accepts one text; separate the location with a vertical bar.
    label = [String(first.code || "Ders").split(".")[0].trim(), first.typeShort].filter(Boolean).join(" ") + " · " + inlineHour(first.startHour) + "-" + inlineHour(first.endHour) +
      " | " + inlineLocation(first);
    [first.startAt, courseVisibleUntil(first)].forEach(function (changeAt) {
      if (changeAt > dashboard.now.getTime() && changeAt + 1000 < widget.refreshAfterDate.getTime()) {
        widget.refreshAfterDate = new Date(changeAt + 1000);
      }
    });
  }
  const node = accessoryText(widget, label, 11, "semibold");
  node.minimumScaleFactor = 0.75;
  return widget;
}

function createAccessoryWidget(family, dashboard) {
  if (family === "accessoryInline") return createInlineCourseWidget(dashboard);
  const courses = dashboard.courses.items;
  if (!courses.length || dashboard.coursesUnavailable) {
    const status = family === "accessoryCircular"
      ? [dashboard.coursesUnavailable ? "Program alınamadı" : "Ders yok", ""]
      : accessoryStatus(dashboard);
    const widget = createAccessoryMessage(family, status[0], status[1]);
    widget.refreshAfterDate = nextRefresh(dashboard);
    return widget;
  }
  const widget = baseWidget(family), m = widgetMetrics(family);
  widget.refreshAfterDate = nextRefresh(dashboard);
  if (family === "accessoryCircular") {
    const root = accessoryCircularContent(widget, m);
    const first = courses[0];
    const code = accessoryCircularCode(first).split("\n");
    accessoryCenteredLine(root, code[0], 10, 8, "bold");
    accessoryCenteredLine(root, [code.slice(1).join(" "), first.typeShort].filter(Boolean).join(" · "), 8, 6.5, "regular", 1);
    accessoryCenteredLine(root, formatHour(first.startHour), 10, 8, "medium");
    accessoryCenteredLine(root, formatHour(first.endHour), 10, 8, "medium");
    const location = [accessoryBuildingInitial(first), accessoryRoom(first)].filter(Boolean).join(" · ") || "Konum yok";
    accessoryCenteredLine(root, location, 10, 7.5, "regular", 0.85);
    return widget;
  }
  const root = box(widget, m.width, m.height, false);
  // Two 27pt lessons + a 10pt header fit even the 153×68pt frame.
  const head = box(root, m.width, 10, true); head.centerAlignContent();
  accessoryText(head, accessoryDay(dashboard), 8, "medium", 0.85);
  head.addSpacer();
  if (dashboard.scheduleStale) {
    icon(head, "clock.arrow.circlepath", 8, new Color("#FFFFFF")); head.addSpacer(3);
  }
  accessoryText(head, courses.length + " ders", 8, "regular", 0.85);
  const headerGap = m.height >= 66 ? 2 : 0;
  root.addSpacer(headerGap);
  const count = Math.min(2, courses.length);
  courses.slice(0, count).forEach(function (course, index) {
    const row = box(root, m.width, 27, false); row.setPadding(1, 3, 1, 3);
    if (index === 0) { row.backgroundColor = new Color("#FFFFFF", 0.12); row.cornerRadius = 4; }
    const top = box(row, m.width - 6, 14, true); top.centerAlignContent();
    const timeWidth = 63, gap = 3;
    const code = box(top, m.width - 6 - timeWidth - gap, 14, true); code.centerAlignContent();
    accessoryText(code, course.code, 11.5, index === 0 ? "semibold" : "medium");
    code.addSpacer();
    top.addSpacer(gap);
    const time = box(top, timeWidth, 14, true); time.centerAlignContent(); time.addSpacer();
    accessoryText(time, course.time, 10, "regular");
    const location = box(row, m.width - 6, 11, true); location.centerAlignContent();
    accessoryText(location, accessoryLocationWithoutFloor(course), 9.2, "regular", 0.85);
    location.addSpacer();
  });
  let remaining = Math.max(0, m.height - 10 - headerGap - count * 27);
  if (count === 1 && courses[0].name && courses[0].name !== courses[0].code && remaining >= 13) {
    const height = Math.min(24, remaining);
    const name = box(root, m.width, height, true); name.setPadding(1, 3, 0, 3);
    accessoryText(name, courses[0].name, 9.5, "regular", 0.85, height >= 23 ? 2 : 1);
    name.addSpacer();
    remaining -= height;
  }
  root.addSpacer(remaining);
  return widget;
}

function createSetupWidget(family) {
  if (isAccessoryFamily(family)) {
    const widget = createAccessoryMessage(family, "Hesabını bağla", "Scriptable’da aç");
    widget.url = URLScheme.forRunningScript();
    return widget;
  }
  const widget = baseWidget(family), m = widgetMetrics(family);
  widget.url = URLScheme.forRunningScript();
  const root = box(widget, m.width, m.height, false);
  renderHeader(root, family, null, m.width);
  root.addSpacer(family === "large" ? 30 : 12);
  text(root, "Kampüsüne bağlan", family === "small" ? 21 : 26, "semibold", COLORS.text, 2);
  root.addSpacer(10);
  text(root, "Yeditepe hesabını eklemek için dokun.", 13, "regular", COLORS.secondary, 3);
  root.addSpacer();
  return widget;
}

function nextRefresh(dashboard) {
  const now = dashboard.now;
  const p = turkeyParts(now);
  const midnight = Date.UTC(p.year, p.month - 1, p.day + 1) - APP.turkeyOffsetMs;
  const candidates = [now.getTime() + APP.refreshMinutes * 60000, midnight + 1000];
  if (dashboard.menuOutdated || dashboard.menuUnavailable) candidates.push(now.getTime() + 60000);
  if (typeof dashboard.courses.nextChangeAt === "number" && dashboard.courses.nextChangeAt > now.getTime()) candidates.push(dashboard.courses.nextChangeAt + 1000);
  if (dashboard.courses.mode === "today") dashboard.courses.items.forEach(function (course) {
    [course.startAt, courseVisibleUntil(course), course.endAt].forEach(function (at) {
      if (at > now.getTime()) candidates.push(at + 1000);
    });
  });
  return new Date(Math.min.apply(null, candidates));
}

function shortDate(date) {
  const p = turkeyParts(date);
  return p.day + " " + MONTHS[p.month - 1] + " " + String(p.hour).padStart(2, "0") + ":" + String(p.minute).padStart(2, "0");
}

async function presentDetails(section) {
  // Older section-specific URLs also open the complete campus view.
  const dashboard = await loadDashboard();
  const view = new WebView();
  await view.loadHTML(buildDetailsHTML(dashboard));
  await view.present(false);
}

function escapeHTML(value) {
  return String(value === null || value === undefined ? "" : value).replace(/[&<>"']/g, function (character) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
  });
}

function detailIcon(key) {
  const paths = {
    courses: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4m8-4v4M3 10h18M8 14h2m4 0h2m-8 4h2"/>',
    exams: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Zm0 0v6h6M8 13h8m-8 4h5"/>',
    location: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    soup: '<ellipse cx="12" cy="10.5" rx="9" ry="2.5"/><path d="M3 10.5c2 13.5 16 13.5 18 0M8 21h8M9 3v2.5M15 3v2.5"/>',
    main: '<circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="6"/>',
    optional: '<path d="M5 12h14M12 5v14"/>',
    warning: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 4v.1"/>'
  };
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[key] || paths.courses) + '</svg>';
}

function buildDetailsHTML(d) {
  const e = escapeHTML, p = turkeyParts(d.now);
  function cssColor(color) { return "#" + String(color.hex).replace(/^#/, ""); }
  const tokens = "--ground:" + cssColor(COLORS.background) + ";--surface:" + cssColor(COLORS.surface) +
    ";--ink:" + cssColor(COLORS.text) + ";--muted:" + cssColor(COLORS.secondary) +
    ";--brand:" + cssColor(COLORS.brand) + ";--accent:" + cssColor(COLORS.accent) + ";--warning:" + cssColor(COLORS.warning);
  const dateLabel = p.day + " " + MONTHS[p.month - 1] + " · " + formatHour(p.hour + p.minute / 60);
  const courses = d.courses.items;
  const courseTitle = d.courses.displayOffset === 1 ? "Yarınki dersler" : "Bugünün dersleri";
  const courseEmpty = d.coursesUnavailable ? "Ders programı alınamadı." : d.courses.displayOffset === 1 ? "Yarın ders yok." : "Başlayacak ders yok.";
  const courseRows = courses.map(function (course, index) {
    const name = course.name && course.name !== course.code ? '<p class="course-name">' + e(titleCaseFood(course.name)) + '</p>' : "";
    return '<li class="course-row' + (index === 0 ? ' next-course' : '') + '"><div class="course-top"><h3>' + e(course.code) +
      '</h3><span class="course-time">' + e(course.time) + '</span></div>' + name +
      '<p class="course-location">' + detailIcon("location") + '<span>' + e(courseLocationLabel(course, course.location)) + '</span></p></li>';
  }).join("");
  const categoryLabels = { soup: "Çorba", main: "Ana yemek", optional: "Opsiyonlar" };
  function foodGroup(group) {
    if (!group.items.length) return "";
    const rows = group.items.map(function (food) {
      return '<li class="food-row"><span>' + e(food.name) + '</span><span class="food-kcal">' + e(food.kcal || "—") + '</span></li>';
    }).join("");
    return '<div class="menu-group"><span class="category-icon" role="img" aria-label="' + e(categoryLabels[group.key] || "Opsiyonlar") + '">' +
      detailIcon(group.key) + '</span><ul class="food-list">' + rows + '</ul></div>';
  }
  const primaryFood = d.menu.filter(function (group) { return group.key !== "optional"; }).map(foodGroup).join("");
  const optionalFood = d.menu.filter(function (group) { return group.key === "optional"; }).map(foodGroup).join("");
  const menuEmpty = d.menuOutdated ? "Güncel menü alınamadı." : d.menuUnavailable ? "Menü alınamadı." : "Menü yayınlanmadı.";
  const examRows = d.exams.map(function (exam) {
    const title = exam.courseCode || titleCaseFood(exam.courseName);
    const name = exam.courseCode && exam.courseName && exam.courseName !== exam.courseCode ? '<p class="exam-name">' + e(titleCaseFood(exam.courseName)) + '</p>' : "";
    const fields = [exam.dateLabel, exam.hour, titleCaseFood(exam.type || "")].filter(Boolean);
    if (exam.weight !== null && exam.weight !== undefined && exam.weight !== "" && isFinite(Number(exam.weight))) fields.push("%" + exam.weight);
    return '<li class="exam-row"><div class="exam-top"><h3>' + e(title) + '</h3><span class="remaining' + (exam.remainingDays <= 1 ? ' near' : '') + '">' +
      e(exam.remainingLabel) + '</span></div>' + name + '<div class="exam-meta">' + fields.map(function (value) { return '<span>' + e(value) + '</span>'; }).join("") + '</div></li>';
  }).join("");
  const notices = [];
  if (d.stale) notices.push("Önbellek" + (d.cacheTime ? " · " + shortDate(new Date(d.cacheTime)) : ""));
  if (d.missingCount) notices.push("Bazı bilgiler alınamadı.");
  if (d.menuOutdated) notices.push("Güncel menü bekleniyor.");
  const notice = notices.length ? '<p class="notice" role="status">' + detailIcon("warning") + '<span>' + e(notices.join(" ")) + '</span></p>' : "";
  return `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:">
<title>Yeditepe Kampüs</title><style>
:root{${tokens};color-scheme:${OPTIONS.theme === "auto" ? "light dark" : OPTIONS.theme};--margin:clamp(16px,3vw,24px);--chrome-top:48px}
*{box-sizing:border-box}html{background:var(--ground);scroll-behavior:smooth;scroll-padding-top:var(--chrome-top);-webkit-text-size-adjust:100%}
body{margin:0;background:var(--ground);color:var(--ink);font:16px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
h1,h2,h3,p,ul,ol{margin:0}ul,ol{list-style:none;padding:0}svg{display:block;width:18px;height:18px;flex:none}
.page{width:100%;max-width:900px;margin-inline:auto;padding:calc(var(--chrome-top) + 8px) max(var(--margin),env(safe-area-inset-right)) max(28px,env(safe-area-inset-bottom)) max(var(--margin),env(safe-area-inset-left))}
.page-head{display:flex;align-items:baseline;justify-content:space-between;gap:16px;flex-wrap:wrap}
h1{font-size:20px;font-weight:600;letter-spacing:-.02em;color:var(--brand)}
.brand-heading{display:flex;align-items:center;gap:7px;min-width:0}
.brand-logo{display:block;width:25.6px;height:20px;object-fit:contain;flex:none}
.page-head time{font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums}
.module-nav{display:flex;gap:24px;margin-top:8px;min-height:40px;align-items:center}
.module-nav a{display:flex;align-items:center;min-height:40px;color:var(--ink);font-size:14px;text-decoration:none}
.module-nav a:active{opacity:.6}.module-nav a:focus-visible{outline:2px solid var(--accent);outline-offset:4px}
.notice{display:flex;gap:8px;color:var(--warning);font-size:13px;margin-top:6px}.notice svg{width:16px;height:16px;margin-top:1px}
.module{margin-top:24px;scroll-margin-top:16px}.module:first-of-type{margin-top:16px}
.section-head{display:flex;align-items:center;gap:8px;margin-bottom:8px;min-height:24px}
.section-head>svg{color:var(--muted)}h2{font-size:17px;font-weight:600;letter-spacing:-.01em}
.section-note{margin-left:auto;color:var(--muted);font-size:13px;white-space:nowrap}
.course-list{display:grid;gap:2px}.course-row{padding:8px;border-radius:6px;min-width:0}.next-course{background:var(--surface)}
.course-top,.exam-top{display:flex;justify-content:space-between;align-items:baseline;gap:12px}
h3{font-size:15px;font-weight:600;min-width:0;overflow-wrap:anywhere}.course-time{font-size:14px;white-space:nowrap;font-variant-numeric:tabular-nums}
.course-name,.exam-name{font-size:14px;margin-top:3px;overflow-wrap:anywhere}
.course-location{display:flex;align-items:flex-start;gap:5px;font-size:13px;color:var(--muted);margin-top:4px;overflow-wrap:anywhere}
.course-location svg{width:14px;height:14px;margin-top:1px}.course-location span{min-width:0}
.menu-columns{display:grid;gap:8px}.menu-column{display:grid;align-content:start;gap:8px}.menu-column:empty{display:none}
.menu-group{display:grid;grid-template-columns:20px minmax(0,1fr);column-gap:8px;align-items:start}
.category-icon{color:var(--muted);padding-top:4px}.category-icon svg{width:18px;height:18px}
.food-row{display:grid;grid-template-columns:minmax(0,1fr) max-content;gap:12px;padding:3px 0;font-size:14px;align-items:baseline}
.food-row>span:first-child{overflow-wrap:anywhere}.food-kcal{color:var(--muted);font-size:13px;min-width:32px;text-align:right;font-variant-numeric:tabular-nums}
.exam-list{display:grid;gap:12px}.exam-row{padding:2px 8px;min-width:0}.remaining{color:var(--accent);font-size:13px;white-space:nowrap}.remaining.near{color:var(--warning)}
.exam-meta{display:flex;flex-wrap:wrap;gap:2px 12px;color:var(--muted);font-size:13px;margin-top:4px;font-variant-numeric:tabular-nums}.exam-meta span{overflow-wrap:anywhere;max-width:100%}
.empty{font-size:14px;color:var(--muted);padding:4px 0}
@media(min-width:660px){.course-row{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);grid-template-areas:"top location" "name location";column-gap:24px}.course-top{grid-area:top}.course-name{grid-area:name}.course-location{grid-area:location;align-self:center;justify-self:center;margin-top:0}.menu-columns{grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}.menu-columns.single{grid-template-columns:minmax(0,1fr)}.exam-list{grid-template-columns:repeat(2,minmax(0,1fr));column-gap:24px;row-gap:14px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
</style></head><body><main class="page">
<header class="page-head"><h1 class="brand-heading"><img class="brand-logo" src="data:image/png;base64,${BRAND_LOGO_BASE64}" width="25.6" height="20" alt="" aria-hidden="true">Yeditepe</h1><time datetime="${e(d.now.toISOString())}">${e(dateLabel)}</time></header>
<nav class="module-nav" aria-label="Bölümler"><a href="#courses">Dersler</a><a href="#menu">Menü</a><a href="#exams">Sınavlar</a></nav>${notice}
<section class="module" id="courses" aria-labelledby="courses-title"><div class="section-head">${detailIcon("courses")}<h2 id="courses-title">${e(courseTitle)}</h2><span class="section-note">${courses.length ? courses.length + " ders" : ""}</span></div>
${courses.length ? '<ol class="course-list">' + courseRows + '</ol>' : '<p class="empty">' + e(courseEmpty) + '</p>'}</section>
<section class="module" id="menu" aria-labelledby="menu-title"><div class="section-head"><h2 id="menu-title">Menü</h2>${d.menu.length ? '<span class="section-note">kcal</span>' : ''}</div>
${d.menu.length ? '<div class="menu-columns' + (!primaryFood || !optionalFood ? ' single' : '') + '"><div class="menu-column">' + primaryFood + '</div><div class="menu-column">' + optionalFood + '</div></div>' : '<p class="empty">' + e(menuEmpty) + '</p>'}</section>
<section class="module" id="exams" aria-labelledby="exams-title"><div class="section-head">${detailIcon("exams")}<h2 id="exams-title">Sınavlar</h2><span class="section-note">${d.exams.length ? d.exams.length + " sınav" : ""}</span></div>
${d.exams.length ? '<ul class="exam-list">' + examRows + '</ul>' : '<p class="empty">' + (d.examsUnavailable ? 'Sınavlar alınamadı.' : APP.examDays + ' gün içinde sınav yok.') + '</p>'}</section>
</main></body></html>`;
}


function turkeyParts(date) {
  const shifted = new Date(date.getTime() + APP.turkeyOffsetMs);
  const jsDay = shifted.getUTCDay();
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    weekday: jsDay === 0 ? 7 : jsDay,
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  };
}


function formatHour(value) {
  const total = Math.max(0, Math.min(1440, Math.round(Number(value) * 60)));
  return String(Math.floor(total / 60)).padStart(2, "0") + ":" + String(total % 60).padStart(2, "0");
}


function firstUseful(values) {
  for (let index = 0; index < values.length; index += 1) {
    if (useful(values[index])) return String(values[index]).trim();
  }
  return null;
}


function useful(value) {
  if (value === null || value === undefined) return false;
  const text = String(value).trim();
  return text !== "" && text !== "-" && text !== "---" && text.toLowerCase() !== "null";
}


function normalizeTurkish(value) {
  return String(value || "")
    .trim()
    .replace(/İ/g, "I")
    .replace(/ı/g, "i")
    .replace(/Ğ/g, "G")
    .replace(/ğ/g, "g")
    .replace(/Ü/g, "U")
    .replace(/ü/g, "u")
    .replace(/Ş/g, "S")
    .replace(/ş/g, "s")
    .replace(/Ö/g, "O")
    .replace(/ö/g, "o")
    .replace(/Ç/g, "C")
    .replace(/ç/g, "c")
    .toLowerCase();
}


function friendlyError(error) {
  if (!error) return "Bilinmeyen bir hata oluştu.";
  if (error.status === 401 || error.status === 403) {
    return "Kullanıcı adı veya şifre sunucu tarafından reddedildi.";
  }
  return error.message || String(error);
}


async function showMessage(title, message) {
  const alert = new Alert();
  alert.title = title;
  alert.message = message;
  alert.addAction("Tamam");
  await alert.presentAlert();
}


const WEEKDAYS = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
];

const MONTHS = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];


try {
  await main();
} catch (error) {
  if (config.runsInWidget) {
    const family = supportedFamily(config.widgetFamily);
    if (isAccessoryFamily(family)) {
      Script.setWidget(createAccessoryMessage(family, "Program alınamadı", "Scriptable’da aç"));
    } else {
      const widget = baseWidget(family);
      const title = widget.addText("Widget çalıştırılamadı");
      title.font = Font.boldSystemFont(13);
      title.textColor = COLORS.danger;
      widget.addSpacer(6);
      const message = widget.addText(friendlyError(error));
      message.font = Font.systemFont(12);
      message.textColor = COLORS.secondary;
      message.lineLimit = 4;
      Script.setWidget(widget);
    }
  } else {
    await showMessage("Widget hatası", friendlyError(error));
  }
} finally {
  Script.complete();
}
