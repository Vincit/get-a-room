type TimePeriod = { start?: string | null; end?: string | null };

type RoomData = {
    id: string | null | undefined;
    name: string | null | undefined;
    capacity: number | null | undefined;
    building: string | null | undefined;
    floor: string | null | undefined;
    features: string[] | null | undefined;
    nextCalendarEvent: string | null | undefined;
    busy?: TimePeriod[] | null | undefined;
    location: string | null | undefined;
};

export default RoomData;
