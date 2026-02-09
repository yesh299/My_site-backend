import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import Input from '../../Shared/components/FormElements/Input';
import Button from '../../Shared/components/FormElements/Button';
import Card from '../../Shared/components/UIElements/Card';
import { VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '../../Shared/util/validators';
import { useForm } from '../../Shared/hooks/form-hook';
import './PlaceForm.css';

const DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Empire State Building',
    description: 'One of the most famous skyscrapers in the world',
    imageUrl:
      'https://images.ctfassets.net/1aemqu6a6t65/6iCC1vCYS1Br0sfIVbVBAH/13cc013e2e3f76bb247452bcfa4eb6d6/empire-state-building-observatory-ctc-7009-3000x2000?w=1200&h=800&q=75',
    address: '20 W 34th St., New York, NY 10001',
    location: { lat: 40.7484405, lng: -73.9882393 },
    creator: 'u1'
  }
];

const UpdatePlace = () => {
  const [isLoading, setIsLoading] = useState(true);
  const placeId = useParams().placeId;

  const [formState, inputHandler, setFormData] = useForm(
    {
      title: { value: '', isValid: false },
      description: { value: '', isValid: false }
    },
    false
  );

  useEffect(() => {
    const identifiedPlace = DUMMY_PLACES.find((p) => p.id === placeId);
    if (identifiedPlace) {
      setFormData(
        {
          title: { value: identifiedPlace.title, isValid: true },
          description: { value: identifiedPlace.description, isValid: true }
        },
        true
      );
    }
    setIsLoading(false);
  }, [placeId, setFormData]);

  if (!DUMMY_PLACES.find((p) => p.id === placeId)) {
    return (
      <div className="center">
        <Card>
          <h2>Could not find place!</h2>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="center">
        <h2>Loading...</h2>
      </div>
    );
  }

  const placeUpdateSubmitHandler = (event) => {
    event.preventDefault();
    console.log('Updated place:', {
      title: formState.inputs.title.value,
      description: formState.inputs.description.value
    });
  };

  return (
    <form className="place-form" onSubmit={placeUpdateSubmitHandler}>
      <Input
        id="title"
        element="input"
        type="text"
        label="Title"
        validators={[VALIDATOR_REQUIRE()]}
        errorText="Please enter a valid title."
        onInput={inputHandler}
        initialValue={formState.inputs.title.value}
        initialValid={formState.inputs.title.isValid}
      />
      <Input
        id="description"
        element="textarea"
        label="Description"
        validators={[VALIDATOR_MINLENGTH(5)]}
        errorText="Please enter at least 5 characters."
        onInput={inputHandler}
        initialValue={formState.inputs.description.value}
        initialValid={formState.inputs.description.isValid}
      />
      <Button type="submit" disabled={!formState.isValid}>
        UPDATE PLACE
      </Button>
    </form>
  );
};

export default UpdatePlace;
