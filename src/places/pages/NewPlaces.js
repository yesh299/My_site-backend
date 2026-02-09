import React, { useContext, useState } from 'react';
import Input from '../../Shared/components/FormElements/Input';
import Button from '../../Shared/components/FormElements/Button';
import { VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '../../Shared/util/validators';
import { useForm } from '../../Shared/hooks/form-hook';
import { api } from '../../util/api';
import AuthContext from '../../Shared/context/auth-context';
import './PlaceForm.css';

const NewPlace = () => {
    const auth = useContext(AuthContext);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [formState, inputHandler] = useForm(
        {
            title: { value: '', isValid: false },
            description: { value: '', isValid: false },
            address: { value: '', isValid: false }
        },
        false
    );

    const placeSubmitHandler = (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);
        const payload = {
            title: formState.inputs.title.value,
            description: formState.inputs.description.value,
            address: formState.inputs.address.value,
            creator: auth.userId || 'u1'
        };
        api.post('/api/places', payload)
            .then(() => {
                // Optionally navigate or reset
                alert('Place created');
            })
            .catch(() => {
                setError('Failed to create place');
            })
            .finally(() => setSubmitting(false));
    };

    return (
        <form className="place-form" onSubmit={placeSubmitHandler}>
            <Input
                id="title"
                element="input"
                type="text"
                label="Title"
                validators={[VALIDATOR_REQUIRE()]}
                errorText="Please enter a valid title."
                onInput={inputHandler}
            />
            <Input
                id="description"
                element="textarea"
                label="Description"
                validators={[VALIDATOR_MINLENGTH(5)]}
                errorText="Please enter at least 5 characters."
                onInput={inputHandler}
            />
            <Input
                id="address"
                element="input"
                label="Address"
                validators={[VALIDATOR_REQUIRE()]}
                errorText="Please enter a valid address."
                onInput={inputHandler}
            />
            {error && <p className="center">{error}</p>}
            <Button type="submit" disabled={!formState.isValid || submitting}>
                ADD PLACE
            </Button>
        </form>
    );
};

export default NewPlace;