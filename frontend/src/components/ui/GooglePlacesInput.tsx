"use client";

import React, { useRef, useEffect } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { Input } from './input';
import { useGoogleMaps } from '../providers/GoogleMapsProvider';
import { Loader2 } from 'lucide-react';

interface GooglePlacesInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function GooglePlacesInput({ value, onChange, placeholder, className }: GooglePlacesInputProps) {
    const { isLoaded } = useGoogleMaps();
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
        autocompleteRef.current = autocomplete;
    };

    const onPlaceChanged = () => {
        if (autocompleteRef.current !== null) {
            const place = autocompleteRef.current.getPlace();
            if (place.formatted_address) {
                onChange(place.formatted_address);
            }
        }
    };

    if (!isLoaded) {
        return (
            <div className="relative">
                <Input disabled placeholder="Initializing Global Network..." className={className} />
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <Autocomplete
            onLoad={onLoad}
            onPlaceChanged={onPlaceChanged}
            options={{
                types: ['(cities)'], // Focus on logistics transit points
            }}
        >
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={className}
            />
        </Autocomplete>
    );
}

