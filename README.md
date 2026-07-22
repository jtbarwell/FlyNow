# FlyNow

<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a id="readme-top"></a>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![LinkedIn][linkedin-shield]][linkedin-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/jtbarwell/FlyNow">
    <img src="frontend/public/FlyNow logo.png" alt="Logo" width="100%" height="100%">
  </a>

<h1 align="center">FlyNow</h1>

<p align="left">
    FlyNow is a software system designed to streamline the flight booking and management process for both travellers and airline staff. The platform offers an intuitive end-to-end travel experience, from searching for a flight all the way to boarding. For travellers, FlyNow supports flight searches by date, airport, and destination. Users can also select their preferred seats, choose luggage options, manage reservations, and receive notifications about flight delays and cancellations. For airline staff, FlyNow provides a dedicated administrative dashboard to manage flight data, view passenger lists, and monitor route performance.
    <br /><br />
</p>
<p align="center">
    <a href="https://github.com/jtbarwell/FlyNow">
        <strong>Explore the docs »</strong>
    </a>
    <br /><br />
    <a href="https://github.com/jtbarwell/FlyNow">
        View Files
    </a>
    &middot;
    <a href="https://github.com/jtbarwell/FlyNow/issues/new?labels=bug&template=bug-report---.md">
        Report Bug
    </a>
    &middot;
    <a href="https://github.com/jtbarwell/FlyNow/issues/new?labels=enhancement&template=feature-request---.md">
        Request Feature
    </a>
</p>
</div>



<!-- TABLE OF CONTENTS -->
<!-- <details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details> -->


The following instructions assume you have [Node.js][Node-url] installed on your device. If you do not, please install it before continuing.

<!-- ABOUT THE PROJECT -->
## Installing the required packages
In this project, we use multiple additional packages not included in the base Node.js install. These include [BCrypt][BCrypt-url], and [Nodemailer][Nodemailer-url]. \
To prepare the project, run the following commands:
### `npm install concurrently --save-dev`
### `npm install react-router-dom`
### `npm install bcrypt`
### `npm install nodemailer`
\
Once these are installed, you can start the app.



## Setting up the email notification system

The backend sends emails (e.g. via `/api/send-email`) using a Gmail account through Nodemailer. This requires a local `.env` file that is **not** committed to git.

### First-time setup (do this once per machine)
 
1. In the `backend/` folder, copy the template:
```bash
   copy .env.example .env
```
 
2. Open `.env` and fill in the real values:
```
   EMAIL_USER=flynow.dev@gmail.com
   EMAIL_PASS="xxxx xxxx xxxx xxxx"
```
   Ask a teammate for the shared "Gmail App Password" — **do not** ask for the Gmail account's real password, and never post the App Password anywhere in the repo, issues, or commit messages.
 
3. Restart the backend. If it's working, you won't see any `Missing credentials` or `EAUTH` errors on startup or when hitting `/api/send-email`.



## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.


## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).



### Built With

* [![React.js][React.js]][React-url]
* [![Node.js][Node.js]][Node-url]
* [![JavaScript][JavaScript]][JavaScript-url]
* [![CSS][CSS]][CSS-url]
* [![Bootstrap][Bootstrap.com]][Bootstrap-url]




<!-- USAGE EXAMPLES -->
<!-- ## Usage

Use this space to show useful examples of how a project can be used. Additional screenshots, code examples and demos work well in this space. You may also link to more resources.

_For more examples, please refer to the [Documentation](https://example.com)_ -->

### Top contributors:

<a href="https://github.com/jtbarwell/FlyNow/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=jtbarwell/FlyNow" alt="contrib.rocks image" />
</a>

<!-- CONTACT -->
## Contact

| Name                          | Email                     | Github                                            | Linkedin                                                                        |
| :----------------------       | :-----------------------  | :-----------------------                          | :-----------------------                                                        |
| Joshua Barwell (He/Him)       | jtbarwell@gmail.com       | [jtbarwell](https://github.com/jtbarwell)         | [joshuabarwell](https://www.linkedin.com/in/joshuabarwell/)                     |
| Dylan Baker (He/Him)          | dylanbaker5353@gmail.com  | [dylanksbaker](https://github.com/dylanksbaker)   | [dylan-baker-9796682a3](https://www.linkedin.com/in/dylan-baker-9796682a3/)     |
| Joan Chen (She/Her)           | chen7953@mylaurier.ca     | [jdcoco](https://github.com/jdcoco)               |                                                                                 |
| Camellia Tran (She/Her)       | camelliatran05@gmail.com  | [camelliaatran](https://github.com/camelliaatran) | [camellia-tran-](https://www.linkedin.com/in/camellia-tran-/)                   |
| Brady Kuzma (He/Him)          | bradykuzma@gmail.com      | [Kuzzi11](https://github.com/Kuzzi11)             | [brady-kuzma](https://www.linkedin.com/in/brady-kuzma/)                         |
| Jose Benedict Laraya (He/Him) | laraya.benedict@gmail.com | [ben-16176](https://github.com/ben-16176)         | [jose-laraya-8b5735269](https://www.linkedin.com/in/jose-laraya-8b5735269/)     |
| Ananthika Raguram (She/Her)   | ananthika.ragu@gmail.com  | [anaragu](https://github.com/anaragu)             | [ananthika-raguram](https://www.linkedin.com/in/ananthika-raguram/)             |
| Harine Murali (She/Her)       | harinems23@gmail.com      | [hairyknee](https://github.com/hairyknee)         | [harine-murali-68a1b22b9](https://www.linkedin.com/in/harine-murali-68a1b22b9/) |


<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
<!-- ## Acknowledgments

* []()
* []()
* []()

<p align="right">(<a href="#readme-top">back to top</a>)</p> -->



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
<!-- https://github.com/inttter/md-badges?tab=readme-ov-file -->
[contributors-shield]: https://img.shields.io/github/contributors/jtbarwell/FlyNow.svg?style=for-the-badge
[contributors-url]: https://github.com/jtbarwell/FlyNow/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/jtbarwell/FlyNow.svg?style=for-the-badge
[forks-url]: https://github.com/jtbarwell/test-repo/network/members
[stars-shield]: https://img.shields.io/github/stars/jtbarwell/FlyNow.svg?style=for-the-badge
[stars-url]: https://github.com/jtbarwell/FlyNow/stargazers
[issues-shield]: https://img.shields.io/github/issues/jtbarwell/FlyNow.svg?style=for-the-badge
[issues-url]: https://github.com/jtbarwell/FlyNow/issues
[license-shield]: https://img.shields.io/github/license/jtbarwell/FlyNow.svg?style=for-the-badge
[license-url]: https://github.com/jtbarwell/FlyNow/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/joshuabarwell
[product-screenshot]: images/screenshot.png

[React.js]: https://img.shields.io/badge/React.js-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/

[Node.js]: https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white
[Node-url]: https://nodejs.org/

[JavaScript]: https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=000
[JavaScript-url]: https://www.javascript.com/

[CSS]: https://img.shields.io/badge/css-246fa6?style=for-the-badge&logo=css&logoColor=white
[CSS-url]: https://www.w3.org/Style/CSS/Overview.en.html

[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com

[BCrypt-url]: https://www.npmjs.com/package/bcrypt-node
[Nodemailer-url]: https://nodemailer.com/
