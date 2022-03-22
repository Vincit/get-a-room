import axios from './axiosConfigurer';

export const getName = async () => {
    const result = await axios.get('name');
    return result.data.name;
};
