export interface AddTimeDetails {
    timeToAdd: number;
}

export interface Booking {
    id: string;
    startTime: string;
    endTime: string;
    room: Room;
}

export interface BookingDetails {
    duration: number;
    title: string;
    roomId: string;
}

export interface Building {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    distance?: number;
}

export interface Preferences {
    building?: Building;
}

type TimePeriod = { start?: string | null; end?: string | null };

export interface Room {
    id: string;
    name: string;
    building: string;
    capacity?: number;
    features?: Array<string>;
    nextCalendarEvent: string;
    busy?: TimePeriod[] | undefined | null;
}

export interface Name {
    name: string;
}
