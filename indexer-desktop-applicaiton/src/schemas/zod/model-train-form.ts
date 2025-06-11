import { z } from "zod";

export const ModelTrainingSchema = z.object({
    number_of_hidden_layers: z
        .number({ required_error: 'Number of hidden layers is required.' })
        .int({ message: 'Must be an integer.' })
        .max(10, { message: 'Cannot have more than 10 hidden layers.' })
        .min(1, { message: 'Must be at least 1 hidden layer.' }),

    number_of_neurons_per_layer: z
        .number({ required_error: 'Number of neurons per layer is required.' })
        .int({ message: 'Must be an integer.' })
        .max(1000, { message: 'Cannot have more than 1000 neurons per layer.' })
        .min(1, { message: 'Must be at least 1 neuron per layer.' }),

    early_stopping_patience: z
        .number({ required_error: 'Early stopping patience is required.' })
        .int({ message: 'Must be an integer.' })
        .max(100, { message: 'Patience cannot be more than 100.' })
        .min(0, { message: 'Patience cannot be negative.' }),

    epochs: z
        .number({ required_error: 'Number of epochs is required.' })
        .int({ message: 'Must be an integer.' })
        .max(1000, { message: 'Cannot train for more than 1000 epochs.' })
        .min(1, { message: 'Must run at least 1 epoch.' }),

    batch_size: z
        .number({ required_error: 'Batch size is required.' })
        .int({ message: 'Must be an integer.' })
        .max(1000, { message: 'Batch size cannot be more than 1000.' })
        .min(1, { message: 'Batch size must be at least 1.' }),

    validation_split: z
        .number({ required_error: 'Validation split is required.' })
        .min(0, { message: 'Validation split must be at least 0.' })
        .max(1, { message: 'Validation split cannot be more than 1.' }),

    using_files: z.boolean({ required_error: 'Using files field is required.' }),

    training_data: z
        .instanceof(File)
        .optional()
        .refine((file) => {
          if (!file) return true; // allow undefined unless required
          return file.name.endsWith('.csv');
        }, {
          message: 'Only CSV files are allowed.',
        }),
}).superRefine((data, ctx) => {
  if (data.using_files && !data.training_data) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['training_data'],
      message: 'Training data file is required when using files.',
    });
  }
});