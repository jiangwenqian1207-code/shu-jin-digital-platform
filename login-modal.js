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
  const resetDialog = (dialog) => {
    dialog.querySelector('.login-form')?.reset();
    dialog.querySelectorAll('.password-toggle').forEach((button) => {
      const input = button.closest('.login-field')?.querySelector('input');
      const icon = button.querySelector('img');
      if (input) input.type = 'password';
      if (icon) icon.src = './public/icons/icon-login-eye-off.svg';
      button.setAttribute('aria-label', '显示密码');
    });
    const submit = dialog.querySelector('.login-submit');
    if (submit) submit.disabled = true;
  };
  const close = (dialog) => {
    resetDialog(dialog);
    setOpen(dialog, false);
    document.querySelectorAll('.account-choice').forEach((button) => button.classList.remove('active'));
  };
  const positionFloatingMenu = (trigger, menu, alignment, width) => {
    const triggerRect = trigger.getBoundingClientRect();
    const header = trigger.closest('.site-header, .library-header');
    const headerBottom = header?.getBoundingClientRect().bottom ?? triggerRect.bottom;
    menu.style.top = `${headerBottom}px`;
    menu.style.left = alignment === 'right'
      ? `${triggerRect.right - width}px`
      : `${triggerRect.left + triggerRect.width / 2}px`;
    menu.style.transform = alignment === 'right' ? 'none' : 'translateX(-50%)';
  };
  const closeFloatingMenus = () => {
    document.querySelectorAll('.language-menu, .profile-menu').forEach((menu) => { menu.hidden = true; });
    document.querySelectorAll('.language, .profile-trigger').forEach((trigger) => {
      trigger.setAttribute('aria-expanded', 'false');
    });
  };

  const profileSwitchers = [];
  document.querySelectorAll('.header-actions').forEach((actions) => {
    const account = actions.querySelector('.account');
    if (!account) return;
    const profile = document.createElement('div');
    profile.className = 'profile-switcher';
    profile.hidden = true;
    profile.innerHTML = '<button class="profile-trigger" type="button" aria-label="打开账户菜单" aria-expanded="false"><img class="profile-avatar" src="./public/user-assets/profile-avatar.png" alt="CoNo 的头像" /><img class="profile-caret" src="./public/icons/icon-dropdown.svg" alt="" /></button><div class="profile-menu" hidden role="menu"><p>目前登录账户</p><div class="profile-current"><img src="./public/user-assets/profile-avatar.png" alt="" /><span><b>CoNo</b><small>个人</small></span><img class="profile-check" src="./public/icons/icon-check.svg" alt="当前账户" /></div><button type="button" role="menuitem">转换为企业账户</button><button type="button" role="menuitem">添加账户</button><button class="profile-logout" type="button" role="menuitem">退出登录</button></div>';
    actions.insertBefore(profile, account);

    const trigger = profile.querySelector('.profile-trigger');
    const menu = profile.querySelector('.profile-menu');
    document.body.append(menu);
    profileSwitchers.push({ profile, account, menu });
    const closeProfileMenu = () => {
      menu.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
    };
    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      if (!isOpen) {
        closeFloatingMenus();
        positionFloatingMenu(trigger, menu, 'right', 168);
      }
      menu.hidden = isOpen;
      trigger.setAttribute('aria-expanded', String(!isOpen));
    });
    document.addEventListener('click', (event) => { if (!profile.contains(event.target) && !menu.contains(event.target)) closeProfileMenu(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeProfileMenu(); });
    window.addEventListener('resize', () => { if (!menu.hidden) positionFloatingMenu(trigger, menu, 'right', 168); });
  });
  const setLoggedIn = (isLoggedIn) => {
    profileSwitchers.forEach(({ profile, account }) => {
      profile.hidden = !isLoggedIn;
      account.hidden = isLoggedIn;
    });
    sessionStorage.setItem('shu-jin-demo-logged-in', String(isLoggedIn));
  };
  profileSwitchers.forEach(({ menu }) => menu.querySelector('.profile-logout')?.addEventListener('click', () => {
    setLoggedIn(false);
    closeFloatingMenus();
  }));
  setLoggedIn(sessionStorage.getItem('shu-jin-demo-logged-in') === 'true');
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
    dialog.querySelector('.login-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      if (dialog === loginDialog && !submit.disabled) {
        setLoggedIn(true);
        close(dialog);
      }
    });
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
    document.body.append(menu);
    const closeMenu = () => {
      menu.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
    };
    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      if (!isOpen) {
        closeFloatingMenus();
        positionFloatingMenu(trigger, menu, 'center', 104);
      }
      menu.hidden = isOpen;
      trigger.setAttribute('aria-expanded', String(!isOpen));
    });
    menu.querySelectorAll('[data-language]').forEach((item) => item.addEventListener('click', () => {
      label.textContent = item.dataset.language;
      document.documentElement.lang = item.dataset.language === 'English' ? 'en' : item.dataset.language === '繁体中文' ? 'zh-Hant' : 'zh-Hans';
      closeMenu();
    }));
    document.addEventListener('click', (event) => { if (!switcher.contains(event.target) && !menu.contains(event.target)) closeMenu(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', () => { if (!menu.hidden) positionFloatingMenu(trigger, menu, 'center', 104); });
  });
})();
