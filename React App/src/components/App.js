import React from "react";
import { Route, useHistory, Switch } from "react-router-dom";
import Header from "./Header";
import Main from "./Main";
import PopupWithForm from "./PopupWithForm";
import ImagePopup from "./ImagePopup";
import api from "../utils/api";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import Register from "./Register";
import Login from "./Login";
import InfoTooltip from "./InfoTooltip";
import ProtectedRoute from "./ProtectedRoute";
import * as auth from "../utils/auth.js";

function App() {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] =
    React.useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] =
    React.useState(false);
  const [isInfoToolTipOpen, setIsInfoToolTipOpen] = React.useState(false);
  const [tooltipStatus, setTooltipStatus] = React.useState("");

  const [selectedCard, setSelectedCard] = React.useState();

  const [currentUser, setCurrentUser] = React.useState("");

  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [email, setEmail] = React.useState("");

  const history = useHistory();

  React.useEffect(() => {
    api.getUserInfo().then((userData) => {
      setCurrentUser(userData);
    });
  }, []);

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }

  function closeAllPopups() {
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setIsInfoToolTipOpen(false);
    setSelectedCard(undefined);
  }

  function handleCardClick(card) {
    setSelectedCard(card);
  }

  function handleUpdateUser(userUpdate) {
    api.setUserInfo(userUpdate).then((newUserData) => {
      setCurrentUser(newUserData);

      closeAllPopups();
    });
  }

  function handleUpdateAvatar(avatarUpdate) {
    api.setUserAvatar(avatarUpdate).then((newUserData) => {
      setCurrentUser(newUserData);

      closeAllPopups();
    });
  }

  const [cards, setCards] = React.useState([]);

  React.useEffect(() => {
    api.getCardList().then((cardData) => {
      setCards(cardData);
    });
  }, []);

  // this code runs when the component mounts
  React.useEffect(() => {
    // get token and email from local storage
    const token = localStorage.getItem("jwt");
    // verify token
    if (token) {
      auth.checkToken(token).then((res) => {
        if (res) {
          setEmail(res.data.email);
          setIsLoggedIn(true);
          history.push("/");
        } else {
          localStorage.removeItem("jwt");
        }
      });
    }
  }, []);

  function handleCardLike(card) {
    const isLiked = card.likes.some((i) => i._id === currentUser._id);
    api.changeLikeCardStatus(card._id, !isLiked).then((newCard) => {
      const newCards = cards.map((c) => (c._id === card._id ? newCard : c));
      setCards(newCards);
    });
  }

  function handleCardDelete(card) {
    api.removeCard(card._id).then(() => {
      const newCards = cards.filter((c) => c._id !== card._id);
      setCards(newCards);
    });
  }

  function handleAddPlaceSubmit(newCard) {
    api.addCard(newCard).then((newCardFull) => {
      setCards([...cards, newCardFull]);

      closeAllPopups();
    });
  }
  function onRegister({ email, password }) {
    auth.register(email, password).then((res) => {
      try {
        if (res.data._id) {
          // all good
          setTooltipStatus("success");
          setIsInfoToolTipOpen(true);
          // log user in
          const userData = {
            email,
            password,
          };
          onLogin(userData);
        } else {
          // incorrect data
          setTooltipStatus("fail");
          setIsInfoToolTipOpen(true);
        }
      } catch (e) {
        // user already exists
        setTooltipStatus("fail");
        setIsInfoToolTipOpen(true);
      }
    });
  }
  function onLogin({ email, password }) {
    auth.login(email, password).then((res) => {
      debugger;
      if (res.token) {
        setIsLoggedIn(true);
        setEmail(email);
        localStorage.setItem("jwt", res.token);
        history.push("/");
      }
    });
  }
  function onSignOut() {
    setIsLoggedIn(false);
    history.push("/signin");
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page__content">
        <Header email={email} onSignOut={onSignOut} />
        <Switch>
          <ProtectedRoute
            exact
            path="/"
            component={Main}
            cards={cards}
            onEditProfile={handleEditProfileClick}
            onAddPlace={handleAddPlaceClick}
            onEditAvatar={handleEditAvatarClick}
            onCardClick={handleCardClick}
            onCardLike={handleCardLike}
            onCardDelete={handleCardDelete}
            loggedIn={isLoggedIn}
          />
          <Route path="/signup">
            <Register onRegister={onRegister} />
          </Route>
          <Route path="/signin">
            <Login onLogin={onLogin} />
          </Route>
        </Switch>
        <footer className="footer page__section">
          <p className="footer__copyright">© 2021 Around</p>
        </footer>
        <EditProfilePopup
          isOpen={isEditProfilePopupOpen}
          onUpdateUser={handleUpdateUser}
          onClose={closeAllPopups}
        />
        <AddPlacePopup
          isOpen={isAddPlacePopupOpen}
          onAddPlace={handleAddPlaceSubmit}
          onClose={closeAllPopups}
        />
        <PopupWithForm
          title="Are you sure?"
          name="remove-card"
          buttonText="Yes"
        />
        <EditAvatarPopup
          isOpen={isEditAvatarPopupOpen}
          onUpdateAvatar={handleUpdateAvatar}
          onClose={closeAllPopups}
        />
        <ImagePopup card={selectedCard} onClose={closeAllPopups} />
        <InfoTooltip
          isOpen={isInfoToolTipOpen}
          onClose={closeAllPopups}
          status={tooltipStatus}
        />
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
