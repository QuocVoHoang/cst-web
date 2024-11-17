'use client'

import { List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RealLocations } from '@/constant/constants';
import axios from 'axios';
import { IRealLocation } from '@/interface';

interface ILocation {
  lat: number;
  lng: number;
}
interface IPathMarker {
  id: number;
  position: ILocation
}

interface IPath {
  id: number;
  midPoint: ILocation;
  flow: number;
  path: ILocation[]
}

export default function useHook() {
  const apiKey = 'AIzaSyAzaD5jXgI9v1-H_iWjY5o4oteSU1dC4OY'

  const [focus, setFocus] = useState({
    dep: false,
    des: false,
  })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [maxFlow, setMaxFlow] = useState<number>(0)
  const [departure, setDeparture] = useState<IRealLocation>()
  const [destination, setDestination] = useState<IRealLocation | null>()
  const [isCar, setIsCar] = useState<boolean>(false)
  const [isShowingMarker, setIsShowingMarker] = useState<boolean>(false)
  const [markers, setMarkers] = useState<IPathMarker[]>([
    { id: 99, position: { lat: 10.800986087081395, lng: 106.61412186202405 } },
    { id: 100, position: { lat: 10.80755318846548, lng: 106.62161128241713 }},
  ])
  const [allPaths, setAllPaths] = useState<number[][]>([])
  const [paths, setPaths] = useState<IPath[]>([])

  useEffect(() => {
    if(allPaths.length > 0) {
      for(let i=0; i<20; i++) {
        const depa = RealLocations.find(location => location.key == allPaths[i][0])
        const dest = RealLocations.find(location => location.key == allPaths[i][1])
  
        if(depa && dest) {
          const newPath = {
            id: Math.random(),
            path: [
              {lat: depa.latitude, lng: depa.longitude},
              {lat: dest.latitude, lng: dest.longitude},
            ],
            midPoint: {
              lat: (depa.latitude + dest.latitude) / 2,
              lng: (depa.longitude + dest.longitude) / 2,
            },
            flow: allPaths[i][2]
          }
  
          setPaths(prev => [...prev, newPath])
        } 
      }
    }


  }, [allPaths])

  useEffect(() => {
    console.log(paths)
  }, [paths])


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
      // const response = await axios.post('http://localhost:8000/', {
        start_location_name: startLocationName,
        end_location_name: endLocationName,
        vehicle: vehicle
      });
      const responseData = response.data
      setMaxFlow(responseData.maxFlow)
      setAllPaths(responseData.allPaths)
    } catch (error) {
      console.error('Error sending string:', error);
    } finally {
      setIsLoading(false)
    }
  };

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
    paths,

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