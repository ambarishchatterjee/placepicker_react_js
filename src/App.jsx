import { useEffect, useRef, useState } from 'react';

import Places from './components/Places.jsx';
import { AVAILABLE_PLACES } from './data.js';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import { sortPlacesByDistance } from './loc.js';

const storeIds = JSON.parse(localStorage.getItem('savedPlaces')) || []
const savedPlaces = storeIds.map((id) => AVAILABLE_PLACES.find((place) => {
  return place.id === id
}))

function App() {
  const modal = useRef();
  const selectedPlace = useRef();
  const [pickedPlaces, setPickedPlaces] = useState(savedPlaces);
  const [availablePlaces, setAvailablePlaces] = useState([])
  const [isModalopen, setIsModalOpen] = useState(false)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const setPlaces = sortPlacesByDistance(
        AVAILABLE_PLACES,
        position.coords.latitude,
        position.coords.longitude
      )
      setAvailablePlaces(setPlaces)
    })

  }, [])

  function handleStartRemovePlace(id) {
    modal.current.open();
    selectedPlace.current = id;
  }

  function handleStopRemovePlace() {
    modal.current.close();
  }

  function handleSelectPlace(id) {
    setPickedPlaces((prevPickedPlaces) => {
      if (prevPickedPlaces.some((place) => place.id === id)) {
        return prevPickedPlaces;
      }
      const place = AVAILABLE_PLACES.find((place) => place.id === id);
      return [place, ...prevPickedPlaces];
    });

    const storeIds = JSON.parse(localStorage.getItem('savedPlaces')) || []
    if (storeIds.indexOf(id) === -1) {
      localStorage.setItem('savedPlaces', JSON.stringify([id, ...storeIds]))
    }
  }

  function handleRemovePlace() {
    setPickedPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current)
    );
    modal.current.close();

    const storeIds = JSON.parse(localStorage.getItem('savedPlaces')) || []
    localStorage.setItem('savedPlaces', JSON.stringify(storeIds.filter((id) => id !== selectedPlace.current)))

  }

  return (
    <>
      <Modal ref={modal}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        <Places
          title="I'd like to visit ..."
          fallbackText={'Select the places you would like to visit below.'}
          places={pickedPlaces}
          onSelectPlace={handleStartRemovePlace}
        />
        <Places
          title="Available Places"
          places={availablePlaces}
          fallbackText={'Sorting data by location'}
          onSelectPlace={handleSelectPlace}
        />
      </main>
    </>
  );
}

export default App;
