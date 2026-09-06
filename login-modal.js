(() => {
  const loginDialog = document.querySelector('.login-dialog:not(.register-dialog)');
  const registerDialog = document.querySelector('.register-dialog');
  if (!loginDialog || !registerDialog) return;

  const setOpen = (dialog, open) => {
    dialog.hidden = !open;
    if (open) dialog.querySelector('input')?.focus();
  };
  const setActiveAccountChoice = (selector) => {
    document.querySelectorAll('.account-choice').forEach((button) => button.classList.toggle('active', button.matches(selector)));
  };
  const close = (dialog) => {
    setOpen(dialog, false);
    document.querySelectorAll('.account-choice').forEach((button) => button.classList.remove('active'));
  };
  const showLogin = () => { setOpen(registerDialog, false); setOpen(loginDialog, true); setActiveAccountChoice('[data-show-login]'); };
  const showRegister = () => { setOpen(loginDialog, false); setOpen(registerDialog, true); setActiveAccountChoice('[data-show-register]'); };

  document.querySelectorAll('[data-show-login], .account-button').forEach((button) => button.addEventListener('click', showLogin));
  document.querySelectorAll('[data-show-register]').forEach((button) => button.addEventListener('click', showRegister));
  loginDialog.querySelector('.login-register button')?.addEventListener('click', showRegister);

  [loginDialog, registerDialog].forEach((dialog) => {
    const card = dialog.querySelector('.login-dialog-card');
    dialog.querySelectorAll('[data-login-close], [data-register-close]').forEach((button) => button.addEventListener('click', () => close(dialog)));
    dialog.addEventListener('click', (event) => { if (!card.contains(event.target)) close(dialog); });
    dialog.querySelectorAll('.password-toggle').forEach((button) => button.addEventListener('click', () => {
      const input = button.closest('.login-field')?.querySelector('input');
      const icon = button.querySelector('img');
      if (!input || !icon) return;
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      icon.src = isHidden ? './public/icons/icon-eye-on.svg' : './public/icons/icon-login-eye-off.svg';
      button.setAttribute('aria-label', isHidden ? '隐藏密码' : '显示密码');
    }));
    dialog.querySelector('.login-form')?.addEventListener('submit', (event) => event.preventDefault());
    const agreement = dialog.querySelector('.login-agreement input');
    const submit = dialog.querySelector('.login-submit');
    agreement?.addEventListener('change', () => { submit.disabled = !agreement.checked; });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    [loginDialog, registerDialog].forEach((dialog) => { if (!dialog.hidden) close(dialog); });
  });

  document.querySelectorAll('.language-switcher').forEach((switcher) => {
    const trigger = switcher.querySelector('.language');
    const label = switcher.querySelector('.language-label');
    const menu = switcher.querySelector('.language-menu');
    if (!trigger || !label || !menu) return;
    if (!menu.querySelector('[data-language="简体中文"]')) {
      const simplified = document.createElement('button');
      simplified.type = 'button';
      simplified.setAttribute('role', 'menuitem');
      simplified.dataset.language = '简体中文';
      simplified.textContent = '简体中文';
      menu.prepend(simplified);
    }
    const closeMenu = () => {
      menu.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
    };
    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      menu.hidden = isOpen;
      trigger.setAttribute('aria-expanded', String(!isOpen));
    });
    menu.querySelectorAll('[data-language]').forEach((item) => item.addEventListener('click', () => {
      label.textContent = item.dataset.language;
      document.documentElement.lang = item.dataset.language === 'English' ? 'en' : item.dataset.language === '繁体中文' ? 'zh-Hant' : 'zh-Hans';
      closeMenu();
    }));
    document.addEventListener('click', (event) => { if (!switcher.contains(event.target)) closeMenu(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
  });
})();
