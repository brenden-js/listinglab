import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {useEffect, useState} from "react";
import {api} from "@/trpc/react";

export const RecentGenerations = ({houseId}: { houseId: string }) => {
  const [showRecentGens, setShowRecentGens] = useState("0");
   const [fetchData, setFetchData] = useState(false);
   const [isFirstOpen, setIsFirstOpen] = useState(true);
   const {data: generations, refetch, isLoading} = api.house.getHouseGenerations.useQuery(houseId, {
     enabled: fetchData,
   });

   useEffect(() => {
     let timer: ReturnType<typeof setTimeout> | undefined;

     if (showRecentGens === "1" && isFirstOpen) {
       setFetchData(true);
       setIsFirstOpen(false);
     } else if (showRecentGens === "1") {
       timer = setTimeout(() => {
         setFetchData(true);
       }, 5000);
     }

     return () => {
       if(timer) {
         clearTimeout(timer);
       }
       setFetchData(false);
     };

   }, [isFirstOpen, showRecentGens]);

   useEffect(() => {
     if (fetchData) void refetch();
   }, [fetchData, refetch]);
  return (
    <Accordion value={showRecentGens} type={"single"} collapsible>
      <AccordionItem value={"1"}>
        <AccordionTrigger onClick={() => setShowRecentGens(showRecentGens === "1" ? "0" : "1")}>
          Recent generations
        </AccordionTrigger>
        <AccordionContent>
          {/*<Button className="inline-block" variant="ghost">*/}
          {/*  <ReloadIcon />*/}
          {/*</Button>*/}
          <ScrollArea className={"flex items-center mx-auto flex-col max-h-[500px] rounded-md pr-4"}>
            {generations?.map((generation) => {
              return (
                <Card key={generation.id} className={"mb-8 min-w-[400px]"}>
                  <CardHeader>
                    <CardTitle>{generation.prompt}</CardTitle>
                    <CardDescription>Created
                      at {generation.createdAt.toDateString()}<br />{generation.model}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {generation.text}
                  </CardContent>
                </Card>
              )
            })}
            {isLoading && generations === undefined && (
              <div>Loading...</div>
            )}
            {!isLoading && !generations?.length && (
              <div>No recent generations</div>
            )}
          </ScrollArea>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}