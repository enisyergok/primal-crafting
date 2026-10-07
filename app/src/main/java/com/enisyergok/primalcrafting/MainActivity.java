package com.enisyergok.primalcrafting;

import android.app.Activity;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RectF;
import android.graphics.Shader;
import android.os.Bundle;
import android.view.MotionEvent;
import android.view.View;

public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(16, 42, 46));
        getWindow().setNavigationBarColor(Color.rgb(11, 29, 32));
        setContentView(new PrimalGameView(this));
    }

    private static final class PrimalGameView extends View {
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Path path = new Path();
        private final RectF gatherButton = new RectF();
        private final RectF fireButton = new RectF();
        private final RectF shelterButton = new RectF();

        private float density;
        private int wood = 1;
        private int stone = 0;
        private int fiber = 1;
        private int energy = 10;
        private int day = 1;
        private int gatherStep = 0;
        private boolean fireBuilt;
        private boolean shelterBuilt;
        private String message = "Gather what the jungle gives you.";

        PrimalGameView(android.content.Context context) {
            super(context);
            density = getResources().getDisplayMetrics().density;
            setFocusable(true);
            setContentDescription("Primal Crafting survival game");
        }

        private float d(float value) {
            return value * density;
        }

        @Override
        protected void onSizeChanged(int width, int height, int oldWidth, int oldHeight) {
            float margin = d(16);
            float buttonHeight = d(54);
            float bottom = height - d(22);
            float gap = d(8);
            float third = (width - margin * 2 - gap * 2) / 3f;
            gatherButton.set(margin, bottom - buttonHeight, margin + third, bottom);
            fireButton.set(margin + third + gap, bottom - buttonHeight,
                    margin + third * 2 + gap, bottom);
            shelterButton.set(margin + third * 2 + gap * 2, bottom - buttonHeight,
                    width - margin, bottom);
        }

        @Override
        protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            int width = getWidth();
            int height = getHeight();
            drawBackdrop(canvas, width, height);
            drawHeader(canvas, width);
            drawWorld(canvas, width, height);
            drawResourcePanel(canvas, width);
            drawCraftPanel(canvas, width, height);
        }

        private void drawBackdrop(Canvas canvas, int width, int height) {
            paint.setShader(new LinearGradient(0, 0, 0, height,
                    Color.rgb(20, 57, 61), Color.rgb(230, 151, 80), Shader.TileMode.CLAMP));
            canvas.drawRect(0, 0, width, height, paint);
            paint.setShader(null);

            paint.setColor(Color.argb(48, 255, 245, 202));
            canvas.drawCircle(width - d(45), d(116), d(34), paint);
            paint.setColor(Color.argb(28, 255, 255, 255));
            canvas.drawCircle(width - d(56), d(105), d(19), paint);

            paint.setColor(Color.rgb(25, 83, 75));
            path.reset();
            path.moveTo(0, d(300));
            path.lineTo(width * .22f, d(222));
            path.lineTo(width * .44f, d(292));
            path.lineTo(width * .70f, d(198));
            path.lineTo(width, d(278));
            path.lineTo(width, height);
            path.lineTo(0, height);
            path.close();
            canvas.drawPath(path, paint);

            paint.setColor(Color.rgb(17, 62, 55));
            path.reset();
            path.moveTo(0, d(348));
            path.lineTo(width * .18f, d(286));
            path.lineTo(width * .35f, d(340));
            path.lineTo(width * .62f, d(256));
            path.lineTo(width, d(324));
            path.lineTo(width, height);
            path.lineTo(0, height);
            path.close();
            canvas.drawPath(path, paint);

            paint.setColor(Color.rgb(11, 45, 43));
            canvas.drawRect(0, d(390), width, height, paint);
        }

        private void drawHeader(Canvas canvas, int width) {
            paint.setColor(Color.argb(235, 9, 31, 34));
            canvas.drawRect(0, 0, width, d(78), paint);

            text(canvas, "PRIMAL", d(18), d(34), d(23), Color.rgb(255, 207, 117), true);
            text(canvas, "CRAFTING", d(20), d(57), d(11), Color.rgb(194, 222, 197), true);

            text(canvas, "DAY " + day, width - d(86), d(27), d(12), Color.WHITE, true);
            text(canvas, "DAWN", width - d(86), d(49), d(11), Color.rgb(255, 190, 113), false);
        }

        private void drawWorld(Canvas canvas, int width, int height) {
            float centerX = width / 2f;
            float groundY = d(387);
            paint.setColor(Color.rgb(129, 76, 50));
            canvas.drawOval(new RectF(centerX - d(88), groundY - d(6), centerX + d(88), groundY + d(18)), paint);

            if (shelterBuilt) {
                paint.setColor(Color.rgb(113, 66, 45));
                path.reset();
                path.moveTo(centerX - d(69), groundY - d(6));
                path.lineTo(centerX, groundY - d(73));
                path.lineTo(centerX + d(69), groundY - d(6));
                path.close();
                canvas.drawPath(path, paint);
                paint.setColor(Color.rgb(197, 142, 87));
                canvas.drawRect(centerX - d(55), groundY - d(4), centerX + d(55), groundY + d(8), paint);
                paint.setColor(Color.rgb(44, 36, 29));
                canvas.drawRect(centerX - d(10), groundY - d(4), centerX + d(10), groundY + d(8), paint);
            }

            if (fireBuilt) {
                paint.setColor(Color.rgb(74, 49, 36));
                canvas.drawCircle(centerX, groundY + d(4), d(25), paint);
                paint.setColor(Color.rgb(255, 189, 71));
                path.reset();
                path.moveTo(centerX, groundY - d(59));
                path.cubicTo(centerX - d(31), groundY - d(29), centerX - d(21), groundY - d(7), centerX, groundY + d(2));
                path.cubicTo(centerX + d(20), groundY - d(8), centerX + d(30), groundY - d(29), centerX, groundY - d(59));
                path.close();
                canvas.drawPath(path, paint);
                paint.setColor(Color.rgb(255, 224, 129));
                canvas.drawCircle(centerX, groundY - d(27), d(10), paint);
            }

            paint.setColor(Color.rgb(209, 155, 91));
            canvas.drawCircle(centerX - d(62), groundY - d(30), d(13), paint);
            paint.setColor(Color.rgb(21, 38, 35));
            canvas.drawCircle(centerX - d(67), groundY - d(32), d(3), paint);
            canvas.drawCircle(centerX - d(57), groundY - d(32), d(3), paint);
            paint.setColor(Color.rgb(83, 51, 38));
            canvas.drawRect(centerX - d(71), groundY - d(16), centerX - d(53), groundY + d(25), paint);
            paint.setColor(Color.rgb(226, 180, 115));
            canvas.drawRect(centerX - d(84), groundY - d(8), centerX - d(40), groundY + d(1), paint);

            textCentered(canvas, shelterBuilt ? "A safe place, for tonight." : "The jungle is watching.", width / 2f,
                    d(174), d(16), Color.rgb(255, 240, 200), true);
            textCentered(canvas, message, width / 2f, d(202), d(12), Color.rgb(237, 218, 178), false);
        }

        private void drawResourcePanel(Canvas canvas, int width) {
            float top = d(228);
            float margin = d(16);
            float gap = d(8);
            float cardWidth = (width - margin * 2 - gap * 2) / 3f;
            drawResourceCard(canvas, margin, top, cardWidth, "WOOD", String.valueOf(wood), Color.rgb(207, 149, 86));
            drawResourceCard(canvas, margin + cardWidth + gap, top, cardWidth, "STONE", String.valueOf(stone), Color.rgb(164, 181, 171));
            drawResourceCard(canvas, margin + (cardWidth + gap) * 2, top, cardWidth, "FIBER", String.valueOf(fiber), Color.rgb(156, 205, 128));
        }

        private void drawResourceCard(Canvas canvas, float left, float top, float width, String label, String value, int color) {
            paint.setColor(Color.argb(216, 9, 31, 34));
            canvas.drawRoundRect(new RectF(left, top, left + width, top + d(64)), d(12), d(12), paint);
            paint.setColor(color);
            canvas.drawCircle(left + d(20), top + d(23), d(8), paint);
            text(canvas, label, left + d(35), top + d(26), d(10), Color.rgb(185, 210, 190), true);
            text(canvas, value, left + d(15), top + d(53), d(20), Color.WHITE, true);
        }

        private void drawCraftPanel(Canvas canvas, int width, int height) {
            float panelTop = height - d(105);
            paint.setColor(Color.argb(225, 8, 28, 30));
            canvas.drawRect(0, panelTop, width, height, paint);
            text(canvas, "SURVIVE · GATHER · CRAFT", d(17), panelTop + d(23), d(10), Color.rgb(180, 207, 188), true);
            text(canvas, "ENERGY " + energy + "/10", width - d(78), panelTop + d(23), d(10), Color.rgb(255, 195, 107), true);

            drawButton(canvas, gatherButton, "GATHER", "+ resource", Color.rgb(44, 112, 94), true);
            drawButton(canvas, fireButton, fireBuilt ? "FIRE ✓" : "FIRE", "3W · 2S", fireBuilt ? Color.rgb(122, 91, 48) : Color.rgb(151, 91, 45), !fireBuilt);
            drawButton(canvas, shelterButton, shelterBuilt ? "SHELTER ✓" : "SHELTER", "6W · 4F", shelterBuilt ? Color.rgb(122, 91, 48) : Color.rgb(151, 91, 45), !shelterBuilt);
        }

        private void drawButton(Canvas canvas, RectF rect, String title, String detail, int color, boolean active) {
            paint.setColor(active ? color : Color.rgb(63, 71, 64));
            canvas.drawRoundRect(rect, d(10), d(10), paint);
            textCentered(canvas, title, rect.centerX(), rect.top + d(22), d(11), Color.WHITE, true);
            textCentered(canvas, detail, rect.centerX(), rect.top + d(41), d(9), Color.rgb(226, 213, 177), false);
        }

        private void gather() {
            if (energy <= 0) {
                day++;
                energy = 10;
                message = "A new dawn. Your strength returns.";
                invalidate();
                return;
            }
            gatherStep = (gatherStep + 1) % 3;
            if (gatherStep == 0) {
                wood++;
                message = "Dry branches. Good fuel.";
            } else if (gatherStep == 1) {
                stone++;
                message = "Sharp stone. Useful for tools.";
            } else {
                fiber++;
                message = "Tough vines. They can hold a roof.";
            }
            energy--;
            invalidate();
        }

        private void craftFire() {
            if (fireBuilt) {
                message = "The fire is warm and steady.";
            } else if (wood >= 3 && stone >= 2) {
                wood -= 3;
                stone -= 2;
                fireBuilt = true;
                message = "Fire kindled. Night will not win easily.";
            } else {
                message = "Need 3 wood and 2 stone for a fire.";
            }
            invalidate();
        }

        private void craftShelter() {
            if (shelterBuilt) {
                message = "Your shelter stands against the wind.";
            } else if (wood >= 6 && fiber >= 4) {
                wood -= 6;
                fiber -= 4;
                shelterBuilt = true;
                message = "Shelter raised. The tribe can endure.";
            } else {
                message = "Need 6 wood and 4 fiber for shelter.";
            }
            invalidate();
        }

        @Override
        public boolean onTouchEvent(MotionEvent event) {
            if (event.getAction() != MotionEvent.ACTION_UP) {
                return true;
            }
            float x = event.getX();
            float y = event.getY();
            if (gatherButton.contains(x, y)) {
                gather();
            } else if (fireButton.contains(x, y)) {
                craftFire();
            } else if (shelterButton.contains(x, y)) {
                craftShelter();
            }
            return true;
        }

        private void text(Canvas canvas, String value, float x, float y, float size, int color, boolean bold) {
            paint.setShader(null);
            paint.setColor(color);
            paint.setTextSize(size);
            paint.setTypeface(bold ? android.graphics.Typeface.DEFAULT_BOLD : android.graphics.Typeface.DEFAULT);
            canvas.drawText(value, x, y, paint);
        }

        private void textCentered(Canvas canvas, String value, float x, float y, float size, int color, boolean bold) {
            paint.setTextSize(size);
            paint.setTypeface(bold ? android.graphics.Typeface.DEFAULT_BOLD : android.graphics.Typeface.DEFAULT);
            text(canvas, value, x - paint.measureText(value) / 2f, y, size, color, bold);
        }
    }
}
