$(document).ready(function () {
  var queryURL =
    "https://api.edamam.com/search?app_id=21bc4c2c&app_key=5729809d1a9d20acc68325bd3944c334";
  // + veganRestrict + vegetarianRestrict + peanutRestrict + treeNutRestrict + sugarRestrict
  var calories;
  var queryMeal;
  var secondQuery;

  //add a listner for all buttons of class recipes
  $(document).on("click", ".listRecipe", displayRecipe);

  // Click event for when the search button is clicked
  $("#searchBtn").on("click", startSearch);

  //click event for returning to the recipe page
  $("#goBackBtn").on("click", function (event) {
    event.preventDefault();
    switchDisplay("secondPage");
  });

  //Function for searching a city and getting data and displaying data on the weather
  function startSearch(event) {
    event.preventDefault();
    var lon;
    var lat;
    //get current geolocation
    navigator.geolocation.getCurrentPosition(
      function (position) {
        switchDisplay("secondPage");
        lat = position.coords.latitude;
        lon = position.coords.longitude;
        lat = lat.toFixed(2);
        lon = lon.toFixed(2);

        var queryURLCurrent =
          "https://api.openweathermap.org/data/2.5/weather?lat=" +
          lat +
          "&lon=" +
          lon +
          "&units=imperial&appid=6f1f4727eeab75aa99bbdae6e23dda36";

        //ajax call to get the current weather
        $.ajax({
          url: queryURLCurrent,
          method: "GET",
        }).then(function (response) {
          //change the city name to the date and time
          $("#currentCity").text(
            response.name + " " + moment().format("MM/DD/YYYY")
          );
          //get the icon of the weather
          var iconEl = $("<img>");
          iconEl.attr(
            "src",
            "https://openweathermap.org/img/w/" +
              response.weather[0].icon +
              ".png"
          );
          //get different weather data some to be used
          var temp = response.main.temp;
          var main = response.weather[0].main;
          //append the weather data
          $("#currentCity").append(iconEl);
          $("#temperature").text(response.main.temp + " F");
          $("#humidity").text(response.main.humidity + "%");
          $("#windspeed").text(response.wind.speed + " MPH");

          weatherToFood(temp, main);
          getDietRestrictions();
        });
      },
      //call if geolocation  is not specified
      function () {
        alert("Geo Location not supported");
      }
    );
  }
  //function to change the weather to a recipe
  function weatherToFood(temp, main) {
    //get the first two digits of the temp and the weather conditions
    var temp1 = temp.toString();
    var temp2 = temp1[1];
    temp1 = temp1[0];

    //relate the first calorie count to the first digit
    switch (temp1) {
      case "1":
        calories = "&calories=1101+";
        break;
      case "2":
        calories = "&calories=1001-1100";
        break;
      case "3":
        calories = "&calories=901-1000";
        break;
      case "4":
        calories = "&calories=801-900";
        break;
      case "5":
        calories = "&calories=701-800";
        break;
      case "6":
        calories = "&calories=601-700";
        break;
      case "7":
        calories = "&calories=501-600";
        break;
      case "8":
        calories = "&calories=401-500";
        break;
      case "9":
        calories = "&calories=301-400";
        break;
      default:
        calories = "&calories=301-400";
        break;
    }
    //add a query call depending on the second digit of temp
    switch (temp2) {
      case "0":
        queryMeal = "&q=lamb";
        break;
      case "1":
        queryMeal = "&q=chicken";
        break;
      case "2":
        queryMeal = "&q=roast";
        break;
      case "3":
        queryMeal = "&q=pork";
        break;
      case "4":
        queryMeal = "&q=turkey";
        break;
      case "5":
        queryMeal = "&q=salad";
        break;
      case "6":
        queryMeal = "&q=beef";
        break;
      case "7":
        queryMeal = "&q=tofu";
        break;
      case "8":
        queryMeal = "&q=fish";
        break;
      case "9":
        queryMeal = "&q=cheese";
        break;
      default:
        queryMeal = "&q=salad";
        break;
    }
    //double check for vegetarian and vegan and remove the meat items
    if (
      $("#vegetarian").prop("checked") == true &&
      (queryMeal !== "&q=salad" ||
        queryMeal !== "&q=tofu" ||
        queryMeal !== "&q=cheese")
    ) {
      queryMeal = "";
    }
    if (
      $("#vegen").prop("checked") == true &&
      (queryMeal !== "&q=salad" || queryMeal !== "&q=tofu")
    ) {
      queryMeal = "";
    }
    //add a second query call bacsed on the conditions
    switch (main) {
      case "Thunderstorm":
        secondQuery = "&q=noodles";
        break;
      case "Drizzle":
        secondQuery = "&q=sandwich";
        break;
      case "Rain":
        secondQuery = "&q=casserole";
        break;
      case "Snow":
        secondQuery = "&q=hearty";
        break;
      case "Clear":
        secondQuery = "&q=sandwich";
        break;
      case "Clouds":
        secondQuery = "&q=dinner";
        break;
      default:
        secondQuery = "&q=sandwich";
        break;
    }
  }

  function getDietRestrictions() {
    queryURL =
      "https://api.edamam.com/search?app_id=21bc4c2c&app_key=5729809d1a9d20acc68325bd3944c334" +
      calories +
      queryMeal +
      secondQuery;
    if ($("#vegan").prop("checked") == true) {
      var veganRestrict = "&health=vegan";
      queryURL = queryURL + veganRestrict;
    }
    if ($("#vegetarian").prop("checked") == true) {
      var vegetarianRestrict = "&health=vegetarian";
      queryURL = queryURL + vegetarianRestrict;
    }
    if ($("#peanut-allergy").prop("checked") == true) {
      var peanutRestrict = "&health=peanut-free";
      queryURL = queryURL + peanutRestrict;
    }
    if ($("#tree-nut-allergy").prop("checked") == true) {
      treeNutRestrict = "&health=tree-nut-free";
      queryURL = queryURL + treeNutRestrict;
    }
    if ($("#sugar-conscious").prop("checked") == true) {
      sugarRestrict = "&health=sugar-conscious";
      queryURL = queryURL + sugarRestrict;
    }
    getRecipes();
  }
  // end of getDietRestrictions

  // Function get recipes from json
  function getRecipes() {
    queryURL = queryURL + calories + queryMeal + secondQuery;

    $.ajax({
      url: queryURL,
      method: "GET",
    }).then(function (response) {
      var recipesResult = response.hits;
      var resultCounter = recipesResult.length;

      if (resultCounter > 6) {
        resultCounter = 5;
      }
      for (var i = 0; i < resultCounter; i++) {
        var recipeEl = $("<li>");
        recipeEl.addClass("listRecipe");
        recipeEl.attr("data-index", JSON.stringify(recipesResult[i].recipe));
        recipeEl.text(recipesResult[i].recipe.label);
        $("#recipeList").append(recipeEl);
      }
    });
  }

  //assuming that there is a recipe array and a list that someone clicked
  function displayRecipe() {
    //get the recipe selected
    var selectedRecipe = $(this).attr("data-index");
    selectedRecipe = JSON.parse(selectedRecipe);
    //change the name, url, and img to the data from the recipe

    $("#recipe-name").text(selectedRecipe.label);
    $("#recipe-url").html("Recipe URL: <a href = " + selectedRecipe.url + " target ='_blank'>See Full Recipe</a>");
    $("#recipeImg").attr("src", selectedRecipe.image);
    $("#recipeImg").attr("alt", selectedRecipe.label);
    //change the ingredients box to include the ingrediants needed
    $("#ingredients-box").empty();
    var ingredientsHeader = $("<h5>Ingredients:<h5>");
    $("#ingredients-box").append(ingredientsHeader);
    var ingredientsList = $("<ul>");

    //add each recipe to the list
    for (var i = 0; i < selectedRecipe.ingredientLines.length; i++) {
      var newingredient = $("<li>");
      newingredient.text(selectedRecipe.ingredientLines[i]);
      ingredientsList.append(newingredient); //maybe prepend
    }
    //append the list to the recipe
    $("#ingredients-box").append(ingredientsList);
    //switch the display to the third page
    switchDisplay("thirdPage");
  }

  //function to switcht the display of the page
  function switchDisplay(toDisplay) {
    if (toDisplay === "firstPage") {
      $("#firstPage").attr("style", "display: block;");
      $("#secondPage").attr("style", "display: none;");
      $("#thirdPage").attr("style", "display: none;");
    } else if (toDisplay === "secondPage") {
      $("#firstPage").attr("style", "display: none;");
      $("#secondPage").attr("style", "display: block;");
      $("#thirdPage").attr("style", "display: none;");
    } else if (toDisplay === "thirdPage") {
      $("#firstPage").attr("style", "display: none;");
      $("#secondPage").attr("style", "display: none;");
      $("#thirdPage").attr("style", "display: block;");
    }
  }
});
