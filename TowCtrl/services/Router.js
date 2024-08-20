const Router = {

  init: () => {

    // document.querySelectorAll("a.navlink").forEach((anchorTag) => {
    //   anchorTag.addEventListener("click", (event) => {
    //     // Stopping the browser from creating new navigation
    //     event.preventDefault();

    //     // Reading the href property of the anchorTag
    //     // Option 1: Using Property
    //     // const url = anchorTag.href;
    //     // Option 2: Using Attribute
    //     // Note: The href property returns the full URL while the getAttribute method will only return the pathname if that is what's in the attribute
    //     const url = anchorTag.getAttribute("href");

    //     // Calling the go method using the url
    //     Router.go(url);
    //   });
    // });

    // Event Handler for URL changes
    window.addEventListener("popstate", (event) => {
      // Reading the route object that was pushed to the History API
      // The second argument (false) prevents adding another entry to the History API
      Router.go(event.state.route, false);
    });

    // Checking the initial URL
    Router.go(location.pathname);
  },

  go: (route, addToHistory = true) => {
    // console.log(`Going to ${route}`);

    if (addToHistory) {
      // Adding route to the History API
      history.pushState({ route }, "", route);
    }

    let pageElement = null;

    // const user = JSON.parse(localStorage.getItem('user'));
    const userID = JSON.parse(localStorage.getItem('userID'));
    const userRole = JSON.parse(localStorage.getItem('userRole'));
    const currentCase = JSON.parse(localStorage.getItem("currentCase"));

    switch (route) {

      // case "/starter-page":
      //   pageElement = document.createElement("start-page");
      //   break;
      // lol

      case "/login":

        pageElement = document.createElement("login-page");
        break;

      case "/offline":

        if (!navigator.onLine) {

          pageElement = document.createElement("offline-page");
          break;

        } else if (userID && userRole === 'user') {

          pageElement = document.createElement("main-client-page");

          break;

        } else if (userID && userRole === 'driver') {

          pageElement = document.createElement("driver-dashboard-page");

          break;

        }
        else {

          pageElement = document.createElement("login-page");

          break;

        }

      case "/registration":

        pageElement = document.createElement("registration-page");
        break;

      case "/":

        if (userID && userRole === 'user') {

          pageElement = document.createElement("main-client-page");

          break;

        } else if (userID && userRole === 'driver') {

          pageElement = document.createElement("driver-dashboard-page");

          break;

        }
        else {

          pageElement = document.createElement("login-page");

          break;

        }

      case "/case":

        if (userID && currentCase && userRole === 'driver') {

          pageElement = document.createElement("driver-view-case-page");
          break;

        }
        else if (userID && userRole === 'user') {

          pageElement = document.createElement("reporter-edit-incident");
          break;

        }
        else {

          pageElement = document.createElement("login-page");

          break;

        }

      case "/registered":

        pageElement = document.createElement("successfully-registered");
        break;

      case "/main-page":

        // if (JSON.parse(localStorage.getItem("user")).role === "user") {
        //   pageElement = document.createElement("main-client-page");
        // } else {
        //   console.log("driver");
        // }

        // break;

        if (userID && userRole === 'user') {

          pageElement = document.createElement("main-client-page");

          break;

        } else if (userID && userRole === 'driver') {

          pageElement = document.createElement("driver-dashboard-page");

          break;

        }
        else {

          pageElement = document.createElement("login-page");

          break;

        }


      case "/report-incident":

        pageElement = document.createElement("report-incident-client");
        break;

      case "/incident-info":

        pageElement = document.createElement("incident-info");
        break;

      default:

        if (userID && userRole === 'user') {

          pageElement = document.createElement("main-client-page");

          break;

        } else if (userID && userRole === 'driver') {

          pageElement = document.createElement("driver-dashboard-page");

          break;

        }
        else {

          pageElement = document.createElement("login-page");

          break;

        }

    }

    // Checking if there is a pageElement to render
    // (If Router found a valid route)
    if (pageElement) {
      // Caching the <main id="app">
      const appContainer = document.querySelector("#app");

      // Clearing the appContainer
      appContainer.innerHTML = "";

      // Inserting the page content
      appContainer.appendChild(pageElement);

      // Resetting the scroll position
      // Going to the top both horizontally and vertically
      window.scrollX = 0;
      window.scrollY = 0;
    } else {
      // Caching the <main id="app">
      const appContainer = document.querySelector("#app");

      pageElement = document.createElement("h1");
      pageElement.textContent = "Page Not Found";

      // Clearing the appContainer
      appContainer.innerHTML = "";

      // Inserting the page content
      appContainer.appendChild(pageElement);

      // Resetting the scroll position
      // Going to the top both horizontally and vertically
      window.scrollX = 0;
      window.scrollY = 0;
    }
  },
};

export default Router;
