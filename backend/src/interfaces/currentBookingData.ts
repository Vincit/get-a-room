import roomData from './roomData';

export default interface currentBookingData {
    id: string | null | undefined;
    startTime: string | null | undefined;
    endTime: string | null | undefined;
    room: roomData | null | undefined;
}
