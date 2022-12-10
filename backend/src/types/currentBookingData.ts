import RoomData from './roomData';

export type CurrentBookingData = {
    id: string | null | undefined;
    startTime: string | null | undefined;
    endTime: string | null | undefined;
    organizerEmail: string | null | undefined;
    resourceStatus: string | null | undefined;
    meetingLink: string | null | undefined;
    room: RoomData;
};

export default CurrentBookingData;
