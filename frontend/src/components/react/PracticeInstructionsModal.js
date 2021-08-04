import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import Grid from "@material-ui/core/Grid";
import Fade from "@material-ui/core/Fade";
import { useState } from "react";

import { darkTheme } from "./darkTheme";
import { Button, Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    backgroundColor: darkTheme.palette.background.paper,
    color: darkTheme.palette.text.primary,
    boxShadow: darkTheme.shadows[5],
    padding: darkTheme.spacing(2, 4, 3),
    maxWidth: "70%",
  },
}));

export default function PracticeInstructionsModal(props) {
  const classes = useStyles();
  const [step, setStep] = useState(0);

  const renderInstructions = () => {
    if (step === 0) {
      return (
        <Grid item>
          <ul>
            <li>
              On this page, you will be asked to copy a piece on text onto the
              digital canvas. As this is just a practice, your handwriting will
              not be recorded during this stage.
            </li>
          </ul>
        </Grid>
      );
    } else if (step === 1) {
      return (
        <Grid item>
          <ul>
            <li>
              Please ensure that your handwriting written in staight lines and
              that any words are not truncated.
            </li>
          </ul>
        </Grid>
      );
    } else if (step === 2) {
      return (
        <Grid item>
          <ul>
            <li>
              If you make a mistake, tap the reset button on the top right
              corner to clear the canvas or refresh this page.
            </li>
            <li>
              When done, tap the continue button continue to the next stage.
            </li>
          </ul>
        </Grid>
      );
    }
  };

  const renderButtons = () => {
    if (step === 0) {
      return (
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setStep(step + 1);
            }}
          >
            Next
          </Button>
        </Grid>
      );
    } else if (step === 1) {
      return (
        <>
          <Grid item>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                setStep(step - 1);
              }}
            >
              Previous
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setStep(step + 1);
              }}
            >
              Next
            </Button>
          </Grid>{" "}
        </>
      );
    } else if (step === 2) {
      return (
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              props.handleClose();
            }}
          >
            Start Writing
          </Button>
        </Grid>
      );
    }
  };

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      className={classes.modal}
      open={props.open}
      onClose={props.handleClose}
    >
      <Fade in={props.open}>
        <div className={classes.paper}>
          <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
          >
            <Grid item>
              <h2> Practice </h2>
            </Grid>
            {renderInstructions()}
            <Grid
              container
              item
              alignItems="center"
              justifyContent="space-evenly"
            >
              {renderButtons()}
            </Grid>
          </Grid>
        </div>
      </Fade>
    </Modal>
  );
}