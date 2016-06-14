;(function(ng) {
  "use strict";

  ng.module('alt.erro-servidor-parser', [])
    .config(['$provide', '$httpProvider', function($provide, $httpProvider) {
        // {
        //      erros: [
        //        {mensagem: 'algum erro 0'},
        //        {mensagem: 'algum erro 1'},
        //        {mensagem: 'algum erro 2'}
        //      ]
        // }

        var NOME_INTERCEPTOR_ERRO_SERVIDOR = 'AltErroServidorInterceptor';

        $provide.factory(NOME_INTERCEPTOR_ERRO_SERVIDOR, ['$q', '$log',
          function($q, $log) {
            var _onServerResponseError = function(error) {
                var _isRespostaComErro = function(info) {
                    return info && info.data && info.data.erros && info.data.erros.length;
                };

                if (_isRespostaComErro(error)) {
                    error.mensagem = error.data.erros[0].mensagem;
                }

                return $q.reject(error);
          };

          return {responseError: _onServerResponseError};
        }]);

        $httpProvider.interceptors.push(NOME_INTERCEPTOR_ERRO_SERVIDOR);
    }])
    .factory('altSanitizeMensagemErroBackend', [function() {
      return function sanitizeErroBackend(error, msg){
        var MSG_DEFAULT = "Houve um problema no momento da requisição.";
        var _erro = {};

        if (angular.isObject(error) && angular.isDefined(error.mensagem)) {
          _erro = error;
        } else {
          _erro = { mensagem : msg || MSG_DEFAULT};
        }
        return _erro.mensagem;
      };
    }]);
}(window.angular));
