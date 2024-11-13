'use client'

import { List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RealLocations } from '@/constant/constants';
import axios from 'axios';
import { IRealLocation } from '@/interface';

export default function useHook() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [maxFlow, setMaxFlow] = useState<number>(0)
  const [departure, setDeparture] = useState<IRealLocation>()
  const [destination, setDestination] = useState<IRealLocation | null>()
  const [isCar, setIsCar] = useState<boolean>(false)
  const [isShowingMarker, setIsShowingMarker] = useState<boolean>(false)

  const onChooseCar = (value: boolean) => {
    setIsCar(value)
    setIsShowingMarker(false)
    setMaxFlow(0)
  }
  const onCalculateMaxFlow = async (startLocationName: string, endLocationName: string, vehicle: string) => {
    try {
      setIsLoading(true)

      setIsShowingMarker(true)
      setDeparture(RealLocations.find(location => location.location == departureText))
      setDestination(RealLocations.find(location => location.location == destinationText))
      
      const response = await axios.post('https://cst-server.vercel.app/', {
        start_location_name: startLocationName,
        end_location_name: endLocationName,
        vehicle: vehicle
      });
      const responseData = response.data
      setMaxFlow(responseData.maxFlow)
      console.log('responseData', responseData.maxFlow)
    } catch (error) {
      console.error('Error sending string:', error);
    } finally {
      setIsLoading(false)
    }
  };

  const apiKey = 'AIzaSyAzaD5jXgI9v1-H_iWjY5o4oteSU1dC4OY'

  const [focus, setFocus] = useState({
    dep: false,
    des: false
  })
  const handleFocus = (dep: boolean, des: boolean) => {
    setFocus({dep, des})
  }
  ///////////////////////////////////////////
  const normalizeString = (str:string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-zA-Z0-9 ]/g, "");
  };
  //////////////////////////////////////////////////////

  const [markers, setMarkers] = useState([
    { id: 1, position: { lat: 10.800986087081395, lng: 106.61412186202405 } },
    { id: 2, position: { lat: 10.80755318846548, lng: 106.62161128241713 }},
  ])

  useEffect(() => {
    if(departure && destination){
      setMarkers([
        { id: 1, position: { lat: departure.latitude, lng: departure.longitude } },
        { id: 2, position: { lat: destination.latitude, lng: destination.longitude } },
      ]);
    }
  }, [departure, destination])

  const mapRef = useRef<google.maps.Map | null>(null);
  const fitBounds = useCallback(() => {
    if (mapRef.current) {
      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach((marker) => bounds.extend(marker.position));
      mapRef.current.fitBounds(bounds);
    }
  }, [markers]);

  useEffect(() => {
    fitBounds();
  }, [markers, fitBounds]);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    fitBounds();
  }, [fitBounds]);
  ////////////////////////////////////////////////////// Deparuter Text
  const [departureText, setDepartureText] = useState<string>('')
  const [departureSuggestions, setDepartureSuggestions] = useState<IRealLocation[]>([]);

  const handleDepartureChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDepartureText(value);

    const normalizedInput = normalizeString(value).toLowerCase();
    const filteredSuggestions = RealLocations.filter(location => 
      normalizeString(location.location).toLowerCase().includes(normalizedInput)
    );
    setTimeout(() => {
      setDepartureSuggestions(filteredSuggestions);
    }, 1000)
  };

  const handleDepartureSuggestionClick = (location: IRealLocation) => {
    setDepartureText(location.location);
    setDepartureSuggestions([]); 
  };

  ////////////////////////////////////////////////////// Destination Text
  const [destinationText, setDestinationText] = useState<string>('')
  const [destinationSuggestions, setDestinationSuggestions] = useState<IRealLocation[]>([]);
  
  const handleDestinationChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestinationText(value);

    const normalizedInput = normalizeString(value).toLowerCase();
    const filteredSuggestions = RealLocations.filter(location =>
      normalizeString(location.location).toLowerCase().includes(normalizedInput)
    );
    setTimeout(() => {
      setDestinationSuggestions(filteredSuggestions);
    }, 1000)
  };

  const handleDestinationSuggestionClick = (location:IRealLocation) => {
    setDestinationText(location.location);
    setDestinationSuggestions([]); 
  };

  ////////////////////////////////////
  const SuggestionList = ({
    suggestions,
    handleChooseSuggestion
  }: {
    suggestions: IRealLocation[], 
    handleChooseSuggestion: (location: IRealLocation) => void
  }) => {
    return(
      suggestions.map((suggestion) => (
        <List key={Math.random()}>
          <ListItem disablePadding key={Math.random()}>
            <ListItemButton key={Math.random()}>
              <ListItemText primary={suggestion.location} onClick={() => handleChooseSuggestion(suggestion)}/>
            </ListItemButton>
          </ListItem>
        </List>
      ))
    )
  }

  ///////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    if(departureText == '') {
      setDepartureSuggestions([])
    }
    if(destinationText == '') {
      setDestinationSuggestions([])
    }
  }, [departureText, destinationText])
  return {
    departureText,
    destinationText,
    isLoading,
    focus,
    maxFlow,
    departureSuggestions,
    destinationSuggestions,
    apiKey,
    markers,
    isCar,
    isShowingMarker,

    onLoad,
    onChooseCar,
    handleDepartureChange,
    handleFocus,
    handleDestinationChange,
    onCalculateMaxFlow,
    handleDepartureSuggestionClick,
    handleDestinationSuggestionClick,
    SuggestionList,
  }
}