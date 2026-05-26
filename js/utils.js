/* ═══════════════════════════════════════════════════════════════
   Utility Functions
   Zentrale Helper-Funktionen für Stream-Overlays
   ═══════════════════════════════════════════════════════════════ */

/**
 * Formatiert große Zahlen auf short-hand (1000 → "1K", 1500000 → "1.5M")
 * @param {number} num - Die zu formatierende Zahl
 * @param {number} decimals - Dezimalstellen (default: 1)
 * @returns {string} Formatierte Zahl
 */
function formatNumber(num, decimals = 1) {
  if (num === 0) return '0';
  if (num === null || num === undefined) return '0';

  const sign = num < 0 ? '-' : '';
  const abs = Math.abs(num);

  if (abs >= 1000000) {
    return sign + (abs / 1000000).toFixed(decimals) + 'M';
  } else if (abs >= 1000) {
    return sign + (abs / 1000).toFixed(decimals) + 'K';
  } else {
    return sign + abs.toFixed(0);
  }
}

/**
 * Formatiert Geldbeträge mit $ und zwei Dezimalstellen
 * @param {number} amount - Der Betrag
 * @returns {string} Formatierter Betrag (z.B. "$125.50")
 */
function formatMoney(amount) {
  if (amount === null || amount === undefined) return '$0.00';
  return '$' + parseFloat(amount).toFixed(2);
}

/**
 * Baut eine AnimatedProgressBar auf
 * @param {HTMLElement} barElement - Das Progress-Bar Element
 * @param {number} current - Aktueller Wert
 * @param {number} goal - Zielwert
 * @param {number} duration - Animation Duration in ms (default: 1500)
 */
function animateProgress(barElement, current, goal, duration = 1500) {
  if (!barElement) return;

  const percentage = Math.min((current / goal) * 100, 100);
  const afterElement = barElement.querySelector('::after');

  // Update CSS variable für Breite
  barElement.style.setProperty('--progress-width', percentage + '%');

  // Trigger Animation
  barElement.classList.remove('animating');
  // Force reflow
  void barElement.offsetWidth;
  barElement.classList.add('animating');

  // Remove animation class nach Duration
  setTimeout(() => {
    barElement.classList.remove('animating');
  }, duration);
}

/**
 * Updated einen Counter mit optionaler Animation
 * @param {HTMLElement} element - Das Counter Element
 * @param {number|string} newValue - Der neue Wert
 * @param {boolean} animate - Mit Animation? (default: true)
 */
function updateCounter(element, newValue, animate = true) {
  if (!element) return;

  const formattedValue = typeof newValue === 'number' ? formatNumber(newValue) : newValue;

  if (animate) {
    element.classList.add('changing');
    setTimeout(() => {
      element.classList.remove('changing');
    }, 300);
  }

  element.textContent = formattedValue;
}

/**
 * Switchet zwischen verschiedenen Screens mit Fade-Animation
 * @param {string} screenName - Name des Screens (z.B. 'goal-progress', 'live-stats')
 * @param {number} fadeDuration - Fade Duration in ms (default: 300)
 */
function switchScreen(screenName, fadeDuration = 300) {
  // Alle Screens finden
  const screens = document.querySelectorAll('[data-screen]');
  let targetScreen = null;

  // Ziel-Screen finden
  for (let screen of screens) {
    if (screen.getAttribute('data-screen') === screenName) {
      targetScreen = screen;
      break;
    }
  }

  if (!targetScreen) {
    console.warn(`Screen '${screenName}' not found`);
    return;
  }

  // Alle anderen Screens ausblenden
  screens.forEach(screen => {
    if (screen === targetScreen) {
      // Ziel-Screen einblenden
      screen.classList.remove('hidden');
      screen.classList.add('animate-fadeIn');
      screen.style.animation = `fadeIn ${fadeDuration}ms ease-out forwards`;
    } else {
      // Andere Screens ausblenden
      screen.classList.add('hidden');
      screen.style.animation = `fadeOut ${fadeDuration}ms ease-out forwards`;
    }
  });
}

/**
 * Setup StreamElements Events
 * @param {Object} callbacks - Callback-Funktionen für Events
 *   - onTip: function(amount, username)
 *   - onFollower: function(username)
 *   - onSubscriber: function(tier, username)
 *   - onRaid: function(raidCount, username)
 *   - onCheer: function(bits, username)
 */
function setupStreamElements(callbacks = {}) {
  // SE Event Listener
  if (window.overlayWindow) {
    window.overlayWindow.addEventListener('EventCreated', event => {
      const data = event.detail.event;

      if (!data) return;

      // Tip Event
      if (data.type === 'tip' && callbacks.onTip) {
        callbacks.onTip(data.amount, data.username);
      }

      // Follower Event
      if (data.type === 'follower' && callbacks.onFollower) {
        callbacks.onFollower(data.username);
      }

      // Subscriber Event
      if (data.type === 'subscriber' && callbacks.onSubscriber) {
        const tier = data.tier ? Math.round(data.tier / 1000) : 1;
        callbacks.onSubscriber(tier, data.username);
      }

      // Raid Event
      if (data.type === 'raid' && callbacks.onRaid) {
        callbacks.onRaid(data.raiders || 0, data.username);
      }

      // Cheer Event
      if (data.type === 'cheer' && callbacks.onCheer) {
        callbacks.onCheer(data.amount, data.username);
      }
    });
  } else {
    console.warn('StreamElements API nicht verfügbar. SE wird nicht funktionieren.');
  }
}

/**
 * Macht eine einfache GET-Request zu StreamElements API
 * @param {string} endpoint - API Endpoint (z.B. '/channels/me')
 * @param {string} token - StreamElements Access Token
 * @returns {Promise<Object>} API Response
 */
async function seApiCall(endpoint, token) {
  try {
    const response = await fetch(`https://api.streamelements.com/kappa/v2${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`SE API Error (${endpoint}):`, error);
    return null;
  }
}

/**
 * Poll SE Tip Leaderboard
 * @param {string} channelId - Channel ID
 * @param {string} token - SE Token
 * @param {Function} callback - Callback mit Daten
 * @param {number} pollInterval - Polling Interval in ms (default: 5000)
 */
function pollTipLeaderboard(channelId, token, callback, pollInterval = 5000) {
  const poll = async () => {
    const data = await seApiCall(`/channels/${channelId}/tips`, token);
    if (data && callback) {
      callback(data);
    }
  };

  // Initial call
  poll();

  // Then poll regularly
  return setInterval(poll, pollInterval);
}

/**
 * Formatiert Zeit (Sekunden zu MM:SS)
 * @param {number} seconds - Sekunden
 * @returns {string} Formatierte Zeit
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Simple Countdown Timer
 * @param {HTMLElement} element - Das Element für Timer
 * @param {number} totalSeconds - Sekunden
 * @param {Function} onComplete - Callback wenn fertig
 */
function startCountdown(element, totalSeconds, onComplete) {
  let remaining = totalSeconds;

  const interval = setInterval(() => {
    if (remaining <= 0) {
      clearInterval(interval);
      if (onComplete) onComplete();
      return;
    }

    element.textContent = formatTime(remaining);
    remaining--;
  }, 1000);

  // Update initial
  element.textContent = formatTime(remaining);

  return interval;
}

/**
 * Log Helper für Development
 * @param {string} message - Message
 * @param {any} data - Optional data
 */
function log(message, data = null) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${message}`, data || '');
}

/* Export für Verwendung */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatNumber,
    formatMoney,
    animateProgress,
    updateCounter,
    switchScreen,
    setupStreamElements,
    seApiCall,
    pollTipLeaderboard,
    formatTime,
    startCountdown,
    log
  };
}
