import * as React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { styled, Typography } from '@mui/material';

const DurationButton = styled(ToggleButton)(() => ({
    padding: '8px 16px'
}));

type DucationPickerProps = {
    onChange: (duration: number) => void;
    title: string;
    duration: number;
    setDuration: React.Dispatch<React.SetStateAction<number>>;
};

const DurationPicker = (props: DucationPickerProps) => {
    const { onChange, title, duration, setDuration } = props;

    const handleChange = (
        event: React.MouseEvent<HTMLElement>,
        newDuration: number
    ) => {
        if (newDuration !== null) {
            setDuration(newDuration);
            onChange(newDuration);
        }
    };

    return (
        <div>
            <Typography
                variant="subtitle1"
                textAlign="left"
                marginBottom={'8px'}
                marginLeft={'24px'}
            >
                {title}
            </Typography>
            <ToggleButtonGroup
                data-testid="DurationPicker"
                color="primary"
                value={duration}
                exclusive
                onChange={handleChange}
                aria-label="duration picker"
                sx={{ marginBottom: '24px' }}
                fullWidth
            >
                <DurationButton
                    data-testid="DurationPicker15"
                    value={15}
                    aria-label="15 minutes"
                >
                    15 min
                </DurationButton>
                <DurationButton
                    data-testid="DurationPicker30"
                    value={30}
                    aria-label="30 minutes"
                >
                    30 min
                </DurationButton>
                <DurationButton
                    data-testid="DurationPicker60"
                    value={60}
                    aria-label="1 hour"
                >
                    1 h
                </DurationButton>
                <DurationButton
                    data-testid="DurationPicker120"
                    value={120}
                    aria-label="2 hours"
                >
                    2 h
                </DurationButton>
            </ToggleButtonGroup>
        </div>
    );
};

export default DurationPicker;
