"use strict";

describe('alt.erro-servidor-parser', function() {
  var _httpMock, _httpBackend, _altSanitizeMensagemErroBackend, _altSanitizeListaMensagensErroBackend;

  beforeEach(module('alt.erro-servidor-parser'));

  beforeEach(inject(function ($injector) {
    _httpMock = $injector.get('$http');
    _httpBackend = $injector.get('$httpBackend');
    _altSanitizeMensagemErroBackend = $injector.get('altSanitizeMensagemErroBackend');
    _altSanitizeListaMensagensErroBackend = $injector.get('altSanitizeListaMensagensErroBackend');
  }));

  describe('altSanitizeMensagemErroBackend', function() {
    describe('criação', function(){
      it('deve retornar uma função', function(){
        expect(typeof _altSanitizeMensagemErroBackend).toBe('function');
      });
    });

    describe('sanitize', function (){
      it('quando o objeto de erro não esta definido o retorno deve ser a mensagem default', function(){
        var _error = undefined;
        var _msgDefault = undefined;

        expect(_altSanitizeMensagemErroBackend(_error, _msgDefault)).toBe("Houve um problema no momento da requisição.");
      });

      it('quando a mensagem default não estiver definida e o objeto de error não tiver mensagemm, o retorno deve ser a mensagem default', function(){
        var _error = {};
        var _msgDefault = undefined;

        expect(_altSanitizeMensagemErroBackend(_error, _msgDefault)).toBe("Houve um problema no momento da requisição.");
      });

      it('quando a mensagem default não estiver definida e o objeto de error não tiver mensagemm, o retorno deve ser a mensagem default', function(){
        var _error = {
          mensagem : 'abc123'
        };
        var _msgDefault = undefined;

        expect(_altSanitizeMensagemErroBackend(_error, _msgDefault)).toBe(_error.mensagem);
      });

      it('quando a mensagem default estiver definida e o objeto de error não tiver mensagemm, o retorno deve ser a mensagem default', function(){
        var _error = {
          mensagem : undefined
        };
        var _msgDefault = 'abc123';

        expect(_altSanitizeMensagemErroBackend(_error, _msgDefault)).toBe(_msgDefault);
      });

      it('quando a mensagem default estiver definida e o objeto de error tiver mensagemm, o retorno deve ser a mensagem do objeto de error', function(){
        var _error = {
          mensagem : '123abc'
        };
        var _msgDefault = 'abc123';

        expect(_altSanitizeMensagemErroBackend(_error, _msgDefault)).toBe(_error.mensagem);
      });
    });
  });

  describe('altSanitizeListaMensagensErroBackend', function() {
    it('deve ser uma função', function() {
      expect(typeof _altSanitizeListaMensagensErroBackend).toBe('function')
    })

    it('deve retornar um array vazio, objeto de erro está undefined', function() {
      var _erro = undefined

      expect(_altSanitizeListaMensagensErroBackend(_erro)).toEqual([])
    })

    it('deve retornar um array vazio, objeto de erro é um objeto vazio', function() {
      var _erro = {}

      expect(_altSanitizeListaMensagensErroBackend(_erro)).toEqual([])
    })

    it('deve retornar um array preenchido com o que está no objeto de erro', function() {
      var _erro = {
        mensagens: [
          {
            mensagem: 'a'
          },
          {
            mensagem: 'b'
          },
          {
            mensagem: 'c'
          }
        ]
      }

      expect(_altSanitizeListaMensagensErroBackend(_erro)).toEqual([
        {
          mensagem: 'a'
        },
        {
          mensagem: 'b'
        },
        {
          mensagem: 'c'
        }
      ])
    })
  })

  describe('interceptor', function() {
    describe('onResponseError', function() {
      it('deve retornar o objeto com erro - o mesmo não obedece ao schema de erros passado pelo servidor', function() {
        var URL = '/algum-lugar';
        var resposta = {a: 'b'}

        _httpBackend.expectGET(URL).respond(400, resposta);

        _httpMock
          .get(URL)
          .then(function() {
            expect(true).toBeFalsy();
          })
          .catch(function(erro) {
            expect(erro).toBeDefined();
            expect(erro.status).toBe(400);
            expect(erro.data.a).toBe('b');
          });

        _httpBackend.flush();
      })

      it('deve retornar o objeto formatado, mensagem passada de acordo com schema definido pelo servidor', function() {
        var URL = '/algum-lugar';
        var resposta = {
          erros: [
            {mensagem: 'b'}
          ]
        }

        _httpBackend.expectGET(URL).respond(400, resposta);

        _httpMock
          .get(URL)
          .then(function() {
            expect(true).toBeFalsy();
          })
          .catch(function(erro) {
            expect(erro).toBeDefined();
            expect(erro.status).toBe(400);
            expect(erro.mensagem).toBe('b');
            expect(erro.mensagens).toEqual([]);
          });

        _httpBackend.flush();
      });

      it('deve retornar o objeto formatado, com apenas uma mensagem de erro', function() {
        var URL = '/algum-lugar';
        var resposta = {
          erros: [
            {mensagem: 'b'},
            {mensagem: 'c'}
          ]
        }

        _httpBackend.expectGET(URL).respond(400, resposta);

        _httpMock
          .get(URL)
          .then(function() {
            expect(true).toBeFalsy();
          })
          .catch(function(erro) {
            expect(erro).toBeDefined();
            expect(erro.status).toBe(400);
            expect(erro.mensagem).toBe('b');
            expect(erro.mensagens).toEqual([
              {
                mensagem: 'c'
              }
            ]);
          });

        _httpBackend.flush();
      });

      it('deve retornar o objeto formatado, com apenas uma mensagem de erro e mais 3 no array', function() {
        var URL = '/algum-lugar';
        var resposta = {
          erros: [
            {mensagem: 'b', outraInfo: '2'},
            {mensagem: 'c', outraInfo: '3'},
            {mensagem: 'd', outraInfo: '4'},
            {mensagem: 'e', outraInfo: '5'},
            {mensagem: 'f', outraInfo: '6'}
          ]
        }

        _httpBackend.expectGET(URL).respond(400, resposta);

        _httpMock
          .get(URL)
          .then(function() {
            expect(true).toBeFalsy();
          })
          .catch(function(erro) {
            expect(erro).toBeDefined();
            expect(erro.status).toBe(400);
            expect(erro.mensagem).toBe('b');
            expect(erro.mensagens).toEqual([
              {
                mensagem: 'c',
                outraInfo: '3'
              },
              {
                mensagem: 'd',
                outraInfo: '4'
              },
              {
                mensagem: 'e',
                outraInfo: '5'
              },
              {
                mensagem: 'f',
                outraInfo: '6'
              }
            ]);
          });

        _httpBackend.flush();
      });
    });
  });
});
