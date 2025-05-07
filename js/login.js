window.addEventListener('load', function () {

    var config = JSON.parse(
      decodeURIComponent(escape(window.atob('@@config@@')))
    );

    const appTitle = config.dict.signin?.title || 'AIRA';
    document.getElementById('app-title').innerText = appTitle;

    var leeway = config.internalOptions.leeway;
    if (leeway) {
      var convertedLeeway = parseInt(leeway);

      if (!isNaN(convertedLeeway)) {
        config.internalOptions.leeway = convertedLeeway;
      }
    }

    var params = {
      overrides: {
        __tenant: config.auth0Tenant,
        __token_issuer: config.authorizationServer.issuer
      },
      domain: config.auth0Domain,
      clientID: config.clientID,
      redirectUri: config.callbackURL,
      responseType: 'code',
      scope: config.internalOptions.scope,
      _csrf: config.internalOptions._csrf,
      state: config.internalOptions.state,
      _intstate: config.internalOptions._intstate,
      ui_locales: 'ja'
    };

    var webAuth = new auth0.WebAuth(params);
    var databaseConnection = 'Username-Password-Authentication';

    function login() {
      var button = document.getElementById('btn-login').value;
      var username = document.getElementById('email').value;
      var password = document.getElementById('password').value;
      button.disabled = true;

      var request = () => {
        webAuth.login({
          realm: databaseConnection,
          username: username,
          password: password,
        }, function (err) {
          if (err) displayError(err);
          button.disabled = false;
        });
      };

      request();
    }

    function displayError(err) {
      var errorMessage = document.getElementById('error-message');
      errorMessage.innerText = translateError(err.policy || err.description);
      errorMessage.style.display = 'block';
    }

    const formAuthentication = document.querySelector('#formAuthentication');

    if (formAuthentication) {
      const fv = FormValidation.formValidation(formAuthentication, {
        fields: {
          email: {
            validators: {
              notEmpty: {
                message: 'メールアドレスを入力してください'
              },
              emailAddress: {
                message: '有効なメールアドレスを入力してください'
              }
            }
          },
          password: {
            validators: {
              notEmpty: {
                message: 'パスワードを入力してください'
              },
              stringLength: {
                min: 5,
                message: 'パスワードは5文字以上で入力してください'
              }
            }
          }
        },
        plugins: {
          trigger: new FormValidation.plugins.Trigger(),
          bootstrap5: new FormValidation.plugins.Bootstrap5({
            eleValidClass: '',
            rowSelector: '.mb-5'
          }),
          submitButton: new FormValidation.plugins.SubmitButton(),
          autoFocus: new FormValidation.plugins.AutoFocus()
        }
      })
        .on('core.form.valid', function () {
          login();
        });
    }

    const toggler = document.querySelector('.form-password-toggle i');
    toggler.addEventListener('click', e => {
      e.preventDefault()
      const formPasswordToggle = toggler.closest('.form-password-toggle')
      const formPasswordToggleIcon = formPasswordToggle.querySelector('i')
      const formPasswordToggleInput = formPasswordToggle.querySelector('input')

      if (formPasswordToggleInput.getAttribute('type') === 'text') {
        formPasswordToggleInput.setAttribute('type', 'password')
        formPasswordToggleIcon.classList.replace('ri-eye-line', 'ri-eye-off-line')
      } else if (formPasswordToggleInput.getAttribute('type') === 'password') {
        formPasswordToggleInput.setAttribute('type', 'text')
        formPasswordToggleIcon.classList.replace('ri-eye-off-line', 'ri-eye-line')
      }
    });
  });

  const errorTranslations = {
    "Wrong email or password.": {
      zh: "邮箱或密码错误",
      ja: "メールアドレスまたはパスワードが間違っています",
    },
    "user is blocked": {
      zh: "该账号已被封禁，请联系管理员",
      ja: "このアカウントはブロックされています。管理者にお問い合わせください。",
    },
    "email is not verified": {
      zh: "邮箱尚未验证，请先完成验证",
      ja: "メールアドレスが未確認です。確認を完了してください。",
    },
    "too many failed login attempts": {
      zh: "登录失败次数过多，请稍后再试",
      ja: "ログイン試行回数が多すぎます。しばらくしてから再試行してください。",
    },
    "connection is disabled": {
      zh: "当前登录方式已被禁用",
      ja: "このログイン方式は無効になっています。",
    },
    "Your account has been disabled.": {
      zh: "账号已被禁用，请联系管理员",
      ja: "アカウントは無効にされています。管理者にお問い合わせください。",
    },
    "unauthorized": {
      zh: "未授权的登录请求",
      ja: "認証されていないログイン要求です。",
    },
    "password_leaked": {
      zh: "检测到密码泄露风险，账号已被保护",
      ja: "パスワード漏洩のリスクが検出されました。アカウントは保護されています。",
    },
  };

  function translateError(message, lang = 'ja') {
    return errorTranslations[message]?.[lang] || 'ログインに失敗しました。しばらくしてからもう一度お試しください';
  }