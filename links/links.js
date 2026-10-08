// Ethan Dunzer: links page
// Share uses the native share sheet where there is one (phones), otherwise
// copies the link to the clipboard.

(function () {
  'use strict';

  var share = document.querySelector('.share');
  var status = document.getElementById('share-status');
  var canonical = document.querySelector('link[rel="canonical"]');
  var url = canonical ? canonical.href : location.href;
  var reset = null;

  function say(text) {
    share.textContent = text;
    if (status) status.textContent = text === 'Share' ? '' : text;
    clearTimeout(reset);
    if (text !== 'Share') reset = setTimeout(function () { say('Share'); }, 2000);
  }

  if (share && (navigator.share || (navigator.clipboard && window.isSecureContext))) {
    share.hidden = false;
    share.addEventListener('click', function () {
      if (navigator.share) {
        navigator.share({ title: document.title, url: url }).catch(function () {});
        return;
      }
      navigator.clipboard.writeText(url).then(
        function () { say('Link copied'); },
        function () { say('Copy failed'); }
      );
    });
  }

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
