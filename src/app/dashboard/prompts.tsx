"use client"
// import {type UseTRPCQueryResult} from '@trpc/react-query/shared';
// import React, {createContext, useEffect, useState} from 'react';
// import {type inferRouterOutputs} from "@trpc/server";
// import {type TRPCClientErrorLike} from '@trpc/react-query';
// import {type AppRouter} from "@/server/api/root";
// import {api} from "@/trpc/react";
// import toast from "react-hot-toast";
//
//
// export type UnhydratedHouse = {
//   stAddress: string,
//   zipCode: string,
//   city: string,
//   state: string,
//   id: string,
//   generations?: { id: string, prompt: string, model: string, text: string }[]
//   expertise: string | null
//   lat: null
//   nearbyPlaces: null
//   investment: null
// }
//
// export type House =
//   UseTRPCQueryResult<inferRouterOutputs<AppRouter>['house']['getHouseDetails'], TRPCClientErrorLike<AppRouter>>['data']
//
//
// export const CurrentPromptContext = createContext({
//   prompt: "",
//   name: "",
//   promptId: "",
//   updateExpertise: (newExpertise: string, houseId: string) => {
//     return
//   },
//   removePrompt: () => {
//     return
//   },
//   changePrompt: (newPrompt: string, promptId: string, name: string) => {
//     return
//   },
//   selectedHouses: [] as (House | UnhydratedHouse)[],
//   addHouse: (newHouse: House | UnhydratedHouse) => {
//     return
//   },
//   removeHouse: (house: House | UnhydratedHouse) => {
//     return
//   },
//   showAdvOptions: "0",
//   setShowAdvOptions: (value: string) => {
//     return
//   }
// })
//
//
// export const PromptsProvider = ({children}: { children: React.ReactNode }) => {
//   const utils = api.useUtils();
//   const removePrompt = () => {
//     setState((prevState) => {
//       return {...prevState, prompt: "", promptId: "", name: ""}
//     })
//   }
//
//   const changePrompt = (newPrompt: string, promptId: string, name: string) => {
//     setState((prevState) => {
//       return {...prevState, prompt: newPrompt, promptId, name}
//     })
//   }
//
//
//   const addHouse = (newHouse: UnhydratedHouse | House) => {
//     if (!newHouse) {
//       toast.error('Could not add house')
//       return
//     }
//     setState((prevState) => {
//       if (prevState.selectedHouses.length >= 1) {
//         toast.error('Maximum number of houses reached', { id: newHouse.id })
//         return { ...prevState } // return here, state update has finished and we can stop executing the function
//       }
//
//       return {...prevState, selectedHouses: [...prevState.selectedHouses, newHouse]}
//     })
//   }
//
//   const removeHouse = (house: UnhydratedHouse | House) => {
//     setState((prevState) => {
//       return {...prevState, selectedHouses: prevState.selectedHouses.filter(h => h !== house)}
//     })
//   }
//
//   const setShowAdvOptions = (value: string) => {
//     setState((prevState) => {
//       return {...prevState, showAdvOptions: value}
//     })
//     localStorage.setItem('showAdvOptions', value);
//   }
//
//   const updateExpertise = (newExpertise: string, houseId: string) => {
//
//     setState((prevState) => {
//
//       if (prevState.selectedHouses.length === 0) {
//         toast.error('No houses found')
//         return prevState;
//       }
//
//       const house = prevState.selectedHouses.find((house: House | UnhydratedHouse) => house?.id === houseId)
//
//       if (house === undefined) {
//         toast.error('House id not found')
//         console.error('House with id, houseId: ', houseId, 'could not be found in the state');
//         return prevState;
//       }
//
//       const updatedHouses = prevState.selectedHouses.map((house) => {
//         if (house?.id === houseId) {
//           return {...house, expertise: newExpertise};
//         }
//         return house
//       });
//
//       return {
//         ...prevState,
//         selectedHouses: updatedHouses
//       };
//     });
//
//     // house was pulled from the server, is a hydrated house. house should automatically get updated
//     utils.house.getHouses.setData(undefined, (oldData) => {
//       if (oldData === undefined) {
//         return oldData
//       }
//       if (oldData.length === 0) {
//         return oldData;
//       }
//       return oldData.map((house) => {
//         if (house?.id === houseId) {
//           return {...house, expertise: newExpertise};
//         }
//         return house;
//       });
//     });
//
//
//     // update selected houses
//     setState((prevState) => {
//       console.log('Setting the prompt context...')
//       const updated = prevState.selectedHouses.map((house) => {
//         if (house?.id === houseId) {
//           return {...house, expertise: newExpertise};
//         }
//         return house
//       })
//       return {
//         ...prevState,
//         selectedHouses: updated
//       }
//     })
//     toast.success('Succesfully updated local expertise')
//   }
//
//   const initState = {
//     prompt: "",
//     promptId: "",
//     name: "",
//     selectedHouses: [] as (House | UnhydratedHouse)[],
//     updateExpertise,
//     removePrompt,
//     changePrompt,
//     addHouse,
//     removeHouse,
//     showAdvOptions: "0",
//     setShowAdvOptions
//   }
//   const [state, setState] = useState(initState);
//
//   useEffect(() => {
//     console.log('New state', state);
//   }, [state]);
//
//   return (
//     <CurrentPromptContext.Provider value={state}>
//       {children}
//     </CurrentPromptContext.Provider>
//   )
// }

export const PromptsProvider = ({children}: { children: React.ReactNode }) => {
  return (
      <div>{children}</div>
  )
}