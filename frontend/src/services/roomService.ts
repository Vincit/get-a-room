import { Room } from '../types';
import { DateTime } from 'luxon';
import axios from './axiosConfigurer';

export const getRooms = async (
    buildingId?: string,
    showReserved?: boolean
): Promise<Room[]> => {
    const urlParams = new URLSearchParams();
    if (buildingId) {
        urlParams.append('building', buildingId);
    }
    if (showReserved) {
        urlParams.append('showReserved', showReserved.toString());
    }

    // Add local end of day as end time for room availability lookup
    // Should this be moved somewhere else?
    urlParams.append('until', DateTime.local().endOf('day').toUTC().toISO());

    const response = await axios.get('/rooms', { params: urlParams });
    return response.data.rooms;
};
