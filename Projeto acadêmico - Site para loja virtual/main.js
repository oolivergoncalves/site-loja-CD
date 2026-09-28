document.addEventListener('DOMContentLoaded', function () {

/*menu de navegação*/
  const botaoMenu = document.querySelector('.botao-menu-mobile');
  const navPrincipal = document.querySelector('.nav-principal');

  if (botaoMenu && navPrincipal) {
    botaoMenu.addEventListener('click', function () {
      let aberto = navPrincipal.classList.toggle('aberto');
      botaoMenu.classList.toggle('aberto', aberto);
      botaoMenu.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    });

/*Fecha o menu ao clicar em um link*/
    navPrincipal.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navPrincipal.classList.remove('aberto');
        botaoMenu.classList.remove('aberto');
        botaoMenu.setAttribute('aria-expanded', 'false');
      });
    });
  }

/*carrinho guardado no localstorage)*/
  const CHAVE_CARRINHO = 'cds-carrinho';

  function lerCarrinho() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE_CARRINHO)) || [];
    } catch (erro) {
      return [];
    }
  }

  function salvarCarrinho(carrinho) {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
  }

  function totalItensCarrinho(carrinho) {
    return carrinho.reduce(function (soma, item) { return soma + item.quantidade; }, 0);
  }

  function atualizarContadorCarrinho() {
    let contador = document.querySelector('.contador-carrinho');
    if (!contador) return;
    let total = totalItensCarrinho(lerCarrinho());
    contador.textContent = total;
    contador.classList.remove('pulsar');

    void contador.offsetWidth;
    contador.classList.add('pulsar');
  }

  function mostrarToast(mensagem) {
    let toast = document.querySelector('.toast');
    if (!toast) return;
    toast.textContent = mensagem;
    toast.classList.add('mostrar');
    window.clearTimeout(mostrarToast._timer);
    mostrarToast._timer = window.setTimeout(function () {
      toast.classList.remove('mostrar');
    }, 2400);
  }

  function adicionarAoCarrinho(produto) {
    let carrinho = lerCarrinho();
    let existente = carrinho.find(function (item) { return item.id === produto.id; });
    if (existente) {
      existente.quantidade += 1;
    } else {
      carrinho.push({ id: produto.id, nome: produto.nome, preco: produto.preco, quantidade: 1 });
    }
    salvarCarrinho(carrinho);
    atualizarContadorCarrinho();
    mostrarToast('"' + produto.nome + '" adicionado ao carrinho');
  }
/*add*/
  document.querySelectorAll('.botao-add').forEach(function (botao) {
    botao.addEventListener('click', function () {
      let cartao = botao.closest('.cartao-produto');
      if (!cartao) return;
      adicionarAoCarrinho({
        id: cartao.dataset.id,
        nome: cartao.dataset.nome,
        preco: parseFloat(cartao.dataset.preco)
      });
    });
  });

  atualizarContadorCarrinho();

/*filtro de catalogo por genêro*/
  let chips = document.querySelectorAll('.chip');
  let produtos = document.querySelectorAll('[data-genero]');

  if (chips.length && produtos.length) {
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
        chip.setAttribute('aria-pressed', 'true');

        let filtro = chip.dataset.filtro;
        produtos.forEach(function (produto) {
          let mostrar = filtro === 'todos' || produto.dataset.genero === filtro;
          produto.style.display = mostrar ? '' : 'none';
        });

        let contador = document.querySelector('#contagem-resultados');
        if (contador) {
          let visiveis = Array.prototype.filter.call(produtos, function (p) {
            return p.style.display !== 'none';
          }).length;
          contador.textContent = visiveis + (visiveis === 1 ? ' cd encontrado' : ' cds encontrados');
        }
      });
    });
  }

/*menuzinho de perguntas frequentes*/
  document.querySelectorAll('.acordeao-pergunta').forEach(function (botao) {
    botao.addEventListener('click', function () {
      let item = botao.closest('.acordeao-item');
      let resposta = item.querySelector('.acordeao-resposta');
      let estaAberto = item.getAttribute('data-aberto') === 'true';

/*aqui fecha e mantem respostas visiveis*/
      document.querySelectorAll('.acordeao-item').forEach(function (outro) {
        outro.setAttribute('data-aberto', 'false');
        outro.querySelector('.acordeao-resposta').style.maxHeight = null;
        outro.querySelector('.acordeao-pergunta').setAttribute('aria-expanded', 'false');
      });

      if (!estaAberto) {
        item.setAttribute('data-aberto', 'true');
        botao.setAttribute('aria-expanded', 'true');
        resposta.style.maxHeight = resposta.scrollHeight + 'px';
      }
    });
  });

/*validação do form contato*/
  const formContato = document.querySelector('#form-contato');

  if (formContato) {
    var regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function definirErro(campoId, mensagem) {
      let campo = document.querySelector('#' + campoId).closest('.campo');
      let elementoErro = campo.querySelector('.mensagem-erro');
      if (mensagem) {
        campo.classList.add('invalido');
        elementoErro.textContent = mensagem;
      } else {
        campo.classList.remove('invalido');
        elementoErro.textContent = '';
      }
    }

    function validarFormularioContato() {
      let valido = true;

      let nome = document.querySelector('#contato-nome').value.trim();
      if (nome.length < 3) {
        definirErro('contato-nome', 'Informe seu nome completo (mínimo 3 letras).');
        valido = false;
      } else {
        definirErro('contato-nome', null);
      }

      let email = document.querySelector('#contato-email').value.trim();
      if (!regexEmail.test(email)) {
        definirErro('contato-email', 'Informe um e-mail válido, como nome@exemplo.com.');
        valido = false;
      } else {
        definirErro('contato-email', null);
      }

      let assunto = document.querySelector('#contato-assunto').value;
      if (!assunto) {
        definirErro('contato-assunto', 'Selecione um assunto para sua mensagem.');
        valido = false;
      } else {
        definirErro('contato-assunto', null);
      }

      let mensagem = document.querySelector('#contato-mensagem').value.trim();
      if (mensagem.length < 10) {
        definirErro('contato-mensagem', 'Sua mensagem precisa ter pelo menos 10 caracteres.');
        valido = false;
      } else {
        definirErro('contato-mensagem', null);
      }

      return valido;
    }

    formContato.addEventListener('submit', function (evento) {
      evento.preventDefault();

      if (validarFormularioContato()) {
        let confirmacao = document.querySelector('#confirmacao-contato');
        formContato.reset();
        confirmacao.classList.add('mostrar');
        confirmacao.setAttribute('tabindex', '-1');
        confirmacao.focus();
        mostrarToast('Mensagem enviada com sucesso!');
      }
    });

    ['contato-nome', 'contato-email', 'contato-assunto', 'contato-mensagem'].forEach(function (id) {
      document.querySelector('#' + id).addEventListener('blur', validarFormularioContato);
    });
  }

/*validacao form newaslttr*/
  const formNewsletter = document.querySelector('#form-newsletter');
  if (formNewsletter) {
    formNewsletter.addEventListener('submit', function (evento) {
      evento.preventDefault();
      let campoEmail = formNewsletter.querySelector('input[type="email"]');
      let regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (regexEmail.test(campoEmail.value.trim())) {
        mostrarToast('Inscrição confirmada! Fique de olho na sua caixa de entrada.');
        formNewsletter.reset();
      } else {
        campoEmail.style.borderColor = 'var(--vermelho-selo)';
        mostrarToast('Digite um e-mail válido para se inscrever.');
      }
    });
  }

});
