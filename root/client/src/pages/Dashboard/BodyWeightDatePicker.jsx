import {
  Button,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
} from "@chakra-ui/react";
import { CalendarIcon } from "@chakra-ui/icons";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import "./BodyWeightCalendar.css";

const parseLocalDate = (value) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
};

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const BodyWeightDatePicker = ({ value, maxDate, onChange }) => {
  const selectedDate = parseLocalDate(value);
  const latestAllowedDate = parseLocalDate(maxDate);
  const selectedDateLabel = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(selectedDate);

  return (
    <Popover placement="bottom-start" isLazy>
      {({ onClose }) => (
        <>
          <PopoverTrigger>
            <Button
              type="button"
              flex="1"
              w="full"
              justifyContent="space-between"
              bg="gray.700"
              border="1px solid"
              borderColor="gray.600"
              fontWeight="normal"
              _hover={{ bg: "gray.600" }}
              _active={{ bg: "gray.600" }}
              aria-label={`Measurement date: ${selectedDateLabel}`}
            >
              <Text>{selectedDateLabel}</Text>
              <CalendarIcon color="blue.300" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            w="auto"
            bg="gray.800"
            borderColor="gray.600"
            boxShadow="xl"
          >
            <PopoverArrow bg="gray.800" />
            <PopoverBody p={2}>
              <DayPicker
                mode="single"
                selected={selectedDate}
                defaultMonth={selectedDate}
                disabled={{ after: latestAllowedDate }}
                showOutsideDays
                navLayout="around"
                className="body-weight-calendar"
                onSelect={(date) => {
                  if (date) {
                    onChange(formatLocalDate(date));
                    onClose();
                  }
                }}
              />
            </PopoverBody>
          </PopoverContent>
        </>
      )}
    </Popover>
  );
};

export default BodyWeightDatePicker;
