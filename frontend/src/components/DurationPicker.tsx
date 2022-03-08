import * as React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Typography } from '@mui/material';

const CUSTOM_DURATION = -1;

type DucationPickerProps = {
    onChange: (duration: number) => void;
    title: string;
};

const DurationPicker = (props: DucationPickerProps) => {
    const { onChange, title } = props;

    const [duration, setDuration] = React.useState(15);

    const handleChange = (
        event: React.MouseEvent<HTMLElement>,
        newDuration: number
    ) => {
        if (newDuration === CUSTOM_DURATION) {
            // TODO custom duration selection
        } else {
            if (newDuration !== null) {
                setDuration(newDuration);
                onChange(newDuration);
            }
        }
    };

    return (
        <div>
            <Typography
                variant="subtitle1"
                textAlign="left"
                marginBottom={'8px'}
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
            >
                <ToggleButton
                    data-testid="DurationPicker15"
                    value={15}
                    aria-label="15 minutes"
                >
                    15 min
                </ToggleButton>
                <ToggleButton
                    data-testid="DurationPicker30"
                    value={30}
                    aria-label="30 minutes"
                >
                    30 min
                </ToggleButton>
                <ToggleButton
                    data-testid="DurationPicker60"
                    value={60}
                    aria-label="1 hour"
                >
                    1 h
                </ToggleButton>
                <ToggleButton
                    data-testid="DurationPicker120"
                    value={120}
                    aria-label="2 hour"
                >
                    2 h
                </ToggleButton>
                <ToggleButton value={CUSTOM_DURATION} disabled>
                    Custom
                </ToggleButton>
            </ToggleButtonGroup>
        </div>
    );
};

export default DurationPicker;
