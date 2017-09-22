;(function(ng) {
  "use strict";

  ng.module('alt.erro-servidor-parser', [])
    .config(['$provide', '$httpProvider', function($provide, $httpProvider) {
        // INPUT:
        // {
        //      status: 404,
        //      erros: [
        //        {mensagem: 'algum erro 0', outraInfo: '0'},
        //        {mensagem: 'algum erro 1', outraInfo: '1'},
        //        {mensagem: 'algum erro 2', outraInfo: '2'}
        //      ]
        // }

        // OUTPUT:
        // {
        //      mensagem: 'algum erro 0',
        //      status: 404,
        //      mensagens: [
        //        {mensagem: 'algum erro 1', outraInfo: '1'},
        //        {mensagem: 'algum erro 2', outraInfo: '2'}
        //      ]
        // }

        var NOME_INTERCEPTOR_ERRO_SERVIDOR = 'AltErroServidorInterceptor';

        $provide.factory(NOME_INTERCEPTOR_ERRO_SERVIDOR, [
          '$q',
          function($q) {
            var _onServerResponseError = function(errWrapper) {
                var _temErroInformado = errWrapper &&
                                        errWrapper.data &&
                                        errWrapper.data.erros &&
                                        errWrapper.data.erros.length;

                if (_temErroInformado) {
                    var _erros = errWrapper.data.erros;

                    errWrapper.mensagem = _erros[0].mensagem;
                    _erros.shift();
                    errWrapper.mensagens = _erros;
                }

                return $q.reject(errWrapper);
          };

          return {
            responseError: _onServerResponseError
          };
        }]);

        $httpProvider.interceptors.push(NOME_INTERCEPTOR_ERRO_SERVIDOR);
    }])
    .factory('altSanitizeMensagemErroBackend', [function() {
      return function(err, msg) {
        var MSG_DEFAULT = "Houve um problema no momento da requisição.";
        var _erro = {};

        if (ng.isObject(err) && ng.isDefined(err.mensagem)) {
          _erro = err;
        } else {
          _erro = {
            mensagem: msg || MSG_DEFAULT
          };
        }

        return _erro.mensagem;
      };
    }])
    .factory('altSanitizeListaMensagensErroBackend', [function() {
      return function(err) {
        var _erro = ng.isObject(err) ? err : {};
        return _erro.mensagens || [];
      };
    }]);
}(window.angular));
