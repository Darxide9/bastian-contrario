



// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var BCapp = angular.module('todo', ['ionic','ngCordova', 'ngRoute','ngAnimate','ionic-native-transitions']);

BCapp.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider){
   $ionicConfigProvider.navBar.transition('none');
  
  $stateProvider

  .state('parent',{
    abstract : true,
    url : '/parent',
    templateUrl : "parent.html",
    controller : 'parentController',
      resolve : {
            'websiteDataPromise' : function(websiteDataStore){
        return websiteDataStore.promise;
      }
    }
  })
 
  .state('parent.nextevent',{
    url: '/nextevent',
    views:{
      'app-views' :{
      templateUrl : 'nextevent.html',
      controller : 'MainCtrl'
    }
      }
  })

  .state('parent.taplist',{
    url: '/taplist',
    views : {
      'app-views' : {
      templateUrl : 'taplist.html',
      controller : 'BeersCtrl'
    }
   }
    
  })
  .state('parent.tv',{
    url: '/tv',
    views : {
      'app-views' : {
      templateUrl : 'tv.html',
      controller : 'TVcontroller'
     }
    }
    }
    
    
  )
    .state('parent.beershop',{
    url: '/beershop',
    views: {
      'app-views' : {
      templateUrl : 'beershop.html',
      controller : 'BeershopController'
    }
  }
    
    
  });
   $urlRouterProvider.otherwise('/parent/nextevent');

});

BCapp.service('websiteDataStore',function($http, $cordovaSQLite, $interval, notificator){
   
     var websiteData = null;
     function retry(){
      $http.get("http://www.bastiancontrarioparma.it/api/beershop/get_beershop_list").then(function(data){
        websiteData=data.data;
        console.log ("promise resolved");

        
   }, function(){
    alert("La connessione a Internet non è disponibile! Non posso recuperare i dati :-(");
      retry();
   });
 }
  var promise = $http.get("http://www.bastiancontrarioparma.it/api/beershop/get_beershop_list/?json_unescaped_unicode=1",{cache : false}).then(function(data){
    
        websiteData=data.data;
        console.log ("promise resolved");

        
   }, function(){
    alert("La connessione a Internet non è disponibile! Non posso recuperare i dati :-(");
      retry();
   });
notificator.notifyIfUpdated(websiteData);
  $interval(function(

    ){
    $http.get("http://www.bastiancontrarioparma.it/api/beershop/get_beershop_list/?json_unescaped_unicode=1",{cache : false}).then(function(data){
      websiteData = data.data;
      console.log("Just retrieved data");
     
      notificator.notifyIfUpdated(websiteData);
    })
  },7200000)
return {
  promise : promise,
  getEvents : function(){
  var nextevent =websiteData.event_posts[0];
   var imageUrl=nextevent.attachments[0].images.medium_large.url;
   var title = nextevent.title;
   var contentHTML = nextevent.content;
   var content = $(contentHTML).text();  
      return {title : title, content : content, image : imageUrl };
  },
  getTapBeers : function(){
    debugger;
       tapbeers = [];
       var beers = websiteData.tap_beers;
       for (var i = 0 ; i < beers.length; i++){
        tapbeers[i]={
          name : beers[i].name,
          brewery : beers[i].brewery,
          type : beers[i].type,
          alcohol : beers[i].alcohol
        }
       } 
    return tapbeers;
  },
  getBeershopBeers : function(){
    
  var beers = websiteData.beershop_beers;
     beershop_list= [];  
      if(beers.length > 0 ){
        var currentBrewery=null;  
        var breweryBeers = []; //buffer array that stores beers of the same brewery
        for(i=0; i< beers.length; i++){
          if(beers[i].brewery!=currentBrewery){  //new brewery occurring, need to store the brewery name and the brewery's beers for the day into the "final" array 
            if(breweryBeers.length>0){//prevents to push an empty object at the start of the loop
              beershop_list.push({brewery : currentBrewery , beers : breweryBeers});
              breweryBeers = [];   
            }
          }
          currentBrewery = beers[i].brewery;
          breweryBeers.push({
            name : beers[i].name, 
            description : beers[i].description,
            price : beers[i].price
          })           
        }
      }
      else {
        alert("Non ci sono birre disponibili. Potrebbe essersi verificato un'errore, riprova piu tardi")
      }
    
    return beershop_list;
  },
   getTVEvents : function(){
    TV = []; 
      var TVevents= websiteData.tv_events;     
      if(TVevents.length > 0){
         var currentDate=null;  
         var dayEvents = []; //buffer array that stores events occurring at the same day
        for(i=0; i< TVevents.length; i++){
         debugger;

          if(TVevents[i].day!=currentDate){  //new date occurring, need to store the date and the events for the day into the "final" array 
            if(dayEvents.length>0){//prevents to push an empty object at the start of the loop
              
              TV.push({date : currentDate , events : dayEvents});
              dayEvents = []; 
            }
          }
          currentDate = TVevents[i].day;
          dayEvents.push({
            name : TVevents[i].name, 
            type : TVevents[i].type,
            time : TVevents[i].time,
          })  
          if(i==TVevents.length-1){
            TV.push({date : currentDate , events : dayEvents});

          }
             }
        
      }
     else{
      alert("Non ci sono eventi TV disponibili.")
     }
     return TV;
  }
  }
}

);
BCapp.service('notificator', function(){
  var currentData = null;
  var evento ,taplist,tv,beershop;
  evento= false;
  taplist = false;
  tv = false;
  beershop = false;

  return{
    notifyIfUpdated : function(newData){
     if(currentData==null){
      currentData=newData;
     } 
     else {
     if(evento==true){
      if(!(JSON.stringify(currentData.event_posts[0])===JSON.stringify(newData.event_posts[0]))){
     
        document.addEventListener('deviceready', function () {
          cordova.plugins.notification.local.schedule({
            id: 1,
            title: "Bastian Contrario",
            text: "Evento aggiornato",
            badge : 1,
            at : new Date()
          });
        }, false);
     }
    };
      if(tv==true){
        if(!(JSON.stringify(currentData.tv_events)===JSON.stringify(newData.tv_events))){

          document.addEventListener('deviceready', function () {
            cordova.plugins.notification.local.schedule({
              id: 2,
              title: "Bastian Contrario",
              text: "Programmazione TV aggiornata",
              badge : 1,
              at : new Date()
            });
          }, false);
        }    
      };
       if(taplist==true){
              if(!(JSON.stringify(currentData.tap_beers)===JSON.stringify(newData.tap_beers))){
                document.addEventListener('deviceready', function () {
                  cordova.plugins.notification.local.schedule({
                    id: 3,
                    title: "Bastian Contrario",
                    text: "Tap List aggiornata",
                    badge : 1,
                    at : new Date()
                  });
                }, false);
              }     
       };
       if(beershop==true){
        if(!(JSON.stringify(currentData.beershop_beers)===JSON.stringify(newData.beershop_beers))){
          document.addEventListener('deviceready', function () {
            cordova.plugins.notification.local.schedule({
              id: 4,
              title: "Bastian Contrario",
              text: "Beershop aggiornato",
              badge : 1,
              at : new Date()
            });
          }, false);

     }
      };

      currentData = newData;
    }
    },

   setNotifications : function (settings){
    evento = settings.event;
    taplist = settings.taplist;
    tv= settings.tv;
    beershop= settings.beershop;

   } 
 }
  }
 )
BCapp.controller('BeersCtrl', function($scope, $interval, websiteDataStore){


 $scope.beers = websiteDataStore.getTapBeers();
  $scope.$watch('websiteDataStore.getTapBeers()',function(newV, oldV, $scope){
    if(newV){
      $scope.beers=newV;
    }
  })   
});

BCapp.controller('BeershopController', function($scope, $interval,websiteDataStore){
  $scope.beershop_list = websiteDataStore.getBeershopBeers();
  $scope.$watch('websiteDataStore.getBeershopBeers()',function(newV, oldV, $scope){
    if(newV){
      $scope.beershop_list=newV;
    }
  })     
});

BCapp.controller('TVcontroller', function($scope, $interval,websiteDataStore){
    $scope.TV = websiteDataStore.getTVEvents(); 
   $scope.$watch('websiteDataStore.getTVEvents()',function(newV, oldV, $scope){
    if(newV){
      $scope.TV=newV;
    }
  })        
});

BCapp.controller('MainCtrl', function($scope, websiteDataStore, $interval){
  $scope.nextEvent = websiteDataStore.getEvents() ;
   $scope.$watch('websiteDataStore.getEvents()',function(newV, oldV, $scope){
    if(newV){
      $scope.nextEvent=newV;
    }
  })  
});

BCapp.controller('notificationsController', function($scope, $ionicModal, notificator){
  $ionicModal.fromTemplateUrl('notifiche.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
   $scope.notifiche={
    taplist : false,
    tv : false,
    beershop : false,
    event : false
  };

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
    
    notificator.setNotifications($scope.notifiche);
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

BCapp.controller('parentController', function($scope,$state){
$scope.changePage =  function(){
  
   $state.go('parent.beershop');
}
});

BCapp.controller('facebookController',function($scope){
 $scope.toFacebook = function(){window.open('https://www.facebook.com/Bastian-Contrario-675650975896702/', '_system')};
});

BCapp.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {

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
    }

});
})
