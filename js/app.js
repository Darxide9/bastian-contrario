



// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var BCapp = angular.module('todo', ['ionic','ngCordova', 'ngRoute','ngAnimate','angular.filter']);

BCapp.constant('$ionicLoadingConfig', {
 template:"<ion-spinner icon='lines'></ion-spinner>"
});
/*
BCapp.factory('BastianInterceptor',  function($rootScope) {  

    var BastianInterceptor = {
        request: function(config)
      {
        $rootScope.$broadcast('loading:show');
        return config;
      },
      
      //hide loading in case any occurred
      requestError: function(response)
      {
       // $rootScope.$broadcast('loading:hide');
        return response;
      },
      
      //Hide loading once got response
      response: function(response)
      {
        //$rootScope.$broadcast('loading:hide');
        return response;
      },
      
      //Hide loading if got any response error 
      responseError: function(response)
      {
        //$rootScope.$broadcast('loading:hide');
        return response;
      }
    };

    return BastianInterceptor;
    

});
*/
BCapp.directive('collapse',function($timeout){
  return {
    restrict: 'A',
    link: function(scope,element,attrs){
  
      var isCollapsed= true;
      $timeout(function(){  if(scope.$last==true){
                     element[0].style.height = element.children()[0].clientHeight+"px";

       }
       else{ element[0].style.height = "0px";}
             },0);
             
   element.addClass("collapse");

     element.parent().find("button").bind("click",function(){
  
      element.toggleClass("collapse-show-content")
      isCollapsed= !isCollapsed; 
        if(isCollapsed==true && scope.$last==false){
        element[0].style.height = "0px";
      }
      else{
       
        element[0].style.height = element.children()[0].clientHeight+"px";
      }

    
  
     })
     
  }
}})


BCapp.config(['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider', '$httpProvider',function($stateProvider, $urlRouterProvider,
  $ionicConfigProvider,$httpProvider){

  //    $httpProvider.interceptors.push('BastianInterceptor');

  
   //initialize get if not there
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};    
    }    

    // Answer edited to include suggestions from comments
    // because previous version of code introduced browser-related errors

    //disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    // extra
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';


  $stateProvider
  .state('parent',{
    
    url : '/parent',
    templateUrl : "parent.html",
    controller : 'parentController',
      resolve : {

            'websiteDataPromise' : function(websiteDataGetter){
             
        return websiteDataGetter.promise;
      }
      
    }
  })
 


  .state('taplist',{
    url: '/taplist',
      templateUrl : 'taplist.html',
      controller : 'TaplistController'
    
   
    
  })
  .state('tv',{
    url: '/tv',
      templateUrl : 'tv.html',
      controller : 'TVController'
     
    }
    
    
  )
    .state('beershop',{
    url: '/beershop',
      templateUrl : 'beershop.html',
      controller : 'BeershopController'
      
  });
   $urlRouterProvider.otherwise('/parent');

}]);



BCapp.factory('websiteDataGetter',function($http, $cordovaSQLite, notificator, $ionicPopup){

  
     var preparedData={};

  function prepareTVData(data){
var TV = []; 
    var weekMap= {"lunedì" : 0,"martedì" : 1,"mercoledì" :2,"giovedì":3,"venerdì":4,"sabato":5,"domenica":6};// useful to populate the 'week' variable
    var week=[["Lunedì"],["Martedì"],["Mercoledì"],["Giovedì"],["Venerdì"],["Sabato"],["Domenica"]];  //every element of this array will represents a collection of events recurring a particular day of the week, e.g. week[0] will store events occurring on monday, week[1] will store events occurring on tuesday etc..
for(i=0; i<7; i++){
  week[i][1]=[];
}

      var TVevents= data.tv_events;     
      if(TVevents.length > 0){
         var currentDate=null;  
         var dayEvents = []; //buffer array that stores events occurring at the same day
        for(i=0; i< TVevents.length; i++){


        week[weekMap[TVevents[i].day.toLowerCase()]][1].push({
            name : TVevents[i].name.toString().toLowerCase(), 
            type : TVevents[i].type,
            time : TVevents[i].time,
            sport : TVevents[i].sport});
      
      };
      return week;}
    }

 

function prepareData(data){

  preparedData.tap_beers= data.tap_beers;
        preparedData.tv_events= prepareTVData(data);
        preparedData.beershop_list=data.beershop_beers;


        preparedData.event_posts= data.event_posts;
        preparedData.event_posts[0].content= $(preparedData.event_posts[0].content).text()

}

function getData(){

var promise = $http.get("http://www.bastiancontrarioparma.it/api/appdata/get_appdata/?json_unescaped_unicode=1")
    .then(function(res){
      console.log("Data retrieved")
      prepareData(res.data);
    

        
   }, function(res){


      return $ionicPopup.alert({
        title : "Errore di connessione",
        template : "Si è verificato un problema con la connessione a Internet. Assicurati che sia disponibile o prova un'altra rete.",
        cssClass : "popup-dark-full",
        okType : "button-light button-outline",
        okText : "Riprova"
      }).then(function(){
        return getData();
      });
      
 
   })
  return promise;
};

  

return {
  promise : getData(),  

  preparedData :  preparedData,

  updateContent : function(){
    getData()}

  
}

});
BCapp.service('notificator', function(){
  var currentData = null;
  var evento ,taplist,tv,beershop;
  evento= "false";
  taplist = "false";
  tv = "false";
  beershop = "false";

  return{
   saveNotifications : function(settings){
     var db = window.sqlitePlugin.openDatabase({name: 'BastianContrario.db', location: 'default'},function(){
      });
     db.transaction(function(tx){

      tx.executeSql("INSERT OR REPLACE INTO settings VALUES (?,?)",["taplist",settings.taplist.toString()],function(tx,result){

        },function(tx,error){
        });
      tx.executeSql("INSERT  OR REPLACE INTO settings  VALUES (?,?)",["tv",settings.tv.toString()],function(tx,result){

        });
      tx.executeSql("INSERT OR REPLACE INTO settings  VALUES (?,?)",["evento",settings.evento.toString()],function(tx,result){

        });
      tx.executeSql("INSERT OR REPLACE INTO settings VALUES (?,?)",["beershop",settings.beershop.toString()],function(tx,result){

        });
      
     })   
   } ,

   setNotifications : function (settings){   
    
    evento = settings.evento.toString();
    taplist = settings.taplist.toString();
    tv= settings.tv.toString();
    beershop= settings.beershop.toString();
    
    if(evento=="true" || taplist=="true" || tv=="true" || beershop=="true"){
     
     var tags=[];

     if(evento=="true"){
      tags.push("evento");
     }
     if(taplist=="true"){
      tags.push("taplist");
     }
     if(tv=="true"){
      tags.push("tv");
     }
     if(beershop=="true"){
      tags.push("beershop");
     }

 UAirship.setUserNotificationsEnabled(true, function (enabled) {
  
    });
              UAirship.setTags(tags, function () {

    UAirship.getTags(function (tags) {
        tags.forEach(function (tag) {
        })
    })

})
    }
    else{
        UAirship.setUserNotificationsEnabled(false, function (enabled) {
    })
    }

   } ,

   getSettings : function(){
     return {
      evento : evento,
      taplist : taplist,
      tv : tv,
      beershop : beershop
     }
   }
 }
  }
 )
BCapp.controller('TaplistController', function($scope, $interval, websiteDataGetter){
 $scope.beers = websiteDataGetter.preparedData.tap_beers;   
});

BCapp.controller('BeershopController', function($scope, $interval,websiteDataGetter){
 
  $scope.beershop_list = websiteDataGetter.preparedData.beershop_list;


});

BCapp.controller('TVController', function($scope, $interval,websiteDataGetter){
    $scope.TV = websiteDataGetter.preparedData.tv_events;       
});

BCapp.controller('notificationsController', function($scope, $ionicModal, notificator){
  $ionicModal.fromTemplateUrl('notifiche.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });


  $scope.openModal = function() {
    $scope.notifiche=notificator.getSettings();
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    
    notificator.setNotifications($scope.notifiche);
    notificator.saveNotifications($scope.notifiche);
    
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });

 
});
BCapp.controller('contactsController', function($scope, $ionicModal, notificator){
  $ionicModal.fromTemplateUrl('contacts.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() {

    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });

 
});


BCapp.controller('parentController', function($scope,$ionicPopover,websiteDataGetter, $ionicModal){
  $scope.squareactive=false;
  $scope.squareActive= function(){
    $scope.squareactive = !$scope.squareactive;
  }
  $scope.active={"show" :false};
  $scope.rotate={"isactive": false};
  $scope.showDescription= function(){
    $scope.active.show= !$scope.active.show;
    $scope.rotate.isactive= !$scope.rotate.isactive
  }
 
    $scope.nextEvent = websiteDataGetter.preparedData.event_posts[0];

     $ionicPopover.fromTemplateUrl('popover.html', {
    scope: $scope,
        animation: "am-fade-and-scale"

  }).then(function(popover) {
    $scope.popover = popover;
  });


  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };
  $scope.closePopover = function() {
    $scope.popover.hide();
   
  };
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });
  // Execute action on hide popover
  $scope.$on('popover.hidden', function() {
    // Execute action
  });
  // Execute action on remove popover
  $scope.$on('popover.removed', function() {
    // Execute action
  });

  $ionicModal.fromTemplateUrl('flyer.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.flyermodal = modal;
  });

  $scope.openFlyerModal = function($event) {
    
    $scope.flyermodal.show($event);
  };

  $scope.closeFlyerModal = function($event){
    $scope.flyermodal.hide($event);
  }

});

BCapp.controller('facebookController',function($scope){
 $scope.toFacebook = function(){window.open('https://www.facebook.com/Bastian-Contrario-675650975896702/', '_system')};
});

BCapp.run(function($ionicPlatform, notificator,websiteDataGetter,$rootScope,$ionicLoading) {



$rootScope.$on('loading:show', function () {
    $ionicLoading.show()
});

$rootScope.$on('loading:hide', function () {
    $ionicLoading.hide();
});

$rootScope.$on('$stateChangeStart', function () {
    console.log('please wait...');
    $rootScope.$broadcast('loading:show');
});

$rootScope.$on('$stateChangeSuccess', function () {
    console.log('done');
    $rootScope.$broadcast('loading:hide');
});

  $ionicPlatform.ready(function() {
    document.addEventListener("resume", onResume, false);
    function onResume(){
       websiteDataGetter.updateContent();
    }


    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    };

    var db = window.sqlitePlugin.openDatabase({name: 'BastianContrario.db', location: 'default'}, function(){
  
    });
    
db.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='settings'",[],function (result) {
      if (result.rows.length==0) {

       db.transaction(function(tx){
        tx.executeSql("CREATE TABLE IF NOT EXISTS settings (name text PRIMARY KEY, value text)",[]);
        tx.executeSql("INSERT INTO settings VALUES ('evento', 'false')",[],
          function(tx,result){

        },function(tx,error){});

        tx.executeSql("INSERT INTO settings VALUES ('taplist', 'false')",[],function(tx,result){

        });
        tx.executeSql("INSERT INTO settings VALUES ('tv', 'false')",[],function(tx,result){

        });
        tx.executeSql("INSERT INTO settings VALUES ('beershop', 'false')",[],function(tx,result){

        });
       
        //Your logic if table doesnt exist
    })
}
    else{
     db.transaction(function(tx){
      tx.executeSql("SELECT * FROM settings",[],function(tx,result){
        
        var settings={
          taplist : "false",
          tv : "false",
          beershop:"false",
          evento:"false"
        };
        for(var i=0; i<result.rows.length; i++){
          settings[result.rows.item(i).name]=result.rows.item(i).value;
        }
     
        notificator.setNotifications(settings);
      })
     })
    }
});    

     UAirship.setUserNotificationsEnabled(false, function (enabled) {
    })
 
});
})
