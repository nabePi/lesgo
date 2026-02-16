-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Tutor profiles policies
CREATE POLICY "Tutor profiles are viewable by everyone"
  ON public.tutor_profiles FOR SELECT USING (true);

CREATE POLICY "Tutors can insert own profile"
  ON public.tutor_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Tutors can update own profile"
  ON public.tutor_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Bookings policies
CREATE POLICY "Parents can view own bookings"
  ON public.bookings FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Tutors can view bookings assigned to them"
  ON public.bookings FOR SELECT USING (auth.uid() = tutor_id);

CREATE POLICY "Parents can create bookings"
  ON public.bookings FOR INSERT WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Both parties can update booking status"
  ON public.bookings FOR UPDATE USING (
    auth.uid() = parent_id OR auth.uid() = tutor_id
  );

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Parents can create reviews for their bookings"
  ON public.reviews FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- Availability policies
CREATE POLICY "Availability is viewable by everyone"
  ON public.availability FOR SELECT USING (true);

CREATE POLICY "Tutors can manage own availability"
  ON public.availability FOR ALL USING (auth.uid() = tutor_id);

-- Payments policies (view only by involved parties)
CREATE POLICY "Parents can view own payments"
  ON public.payments FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE bookings.id = payments.booking_id 
    AND bookings.parent_id = auth.uid()
  ));

CREATE POLICY "Tutors can view payments for their bookings"
  ON public.payments FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE bookings.id = payments.booking_id 
    AND bookings.tutor_id = auth.uid()
  ));

-- Wallet policies (tutors only)
CREATE POLICY "Tutors can view own wallet"
  ON public.tutor_wallets FOR SELECT USING (auth.uid() = tutor_id);

-- Wallet transactions policies
CREATE POLICY "Tutors can view own transactions"
  ON public.wallet_transactions FOR SELECT USING (auth.uid() = tutor_id);
